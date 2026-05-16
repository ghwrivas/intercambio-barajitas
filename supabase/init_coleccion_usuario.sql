-- ============================================================================
-- FUNCIÓN: Inicializar colección de un usuario recién registrado
--
-- PREGUNTA: ¿Al hacer login el usuario tiene barajitas asignadas?
--
-- RESPUESTA:
--   NO automáticamente. La tabla `coleccion` empieza vacía.
--   Esto es CORRECTO: el usuario marca manualmente lo que tiene (+1, +2...).
--   Las barajitas sin fila en `coleccion` = las busca.
--
-- SIN EMBARGO, puedes usar esta función para PRE-CARGAR todas las barajitas
-- con cantidad=0 cuando el usuario se registra. Esto permite:
--   - Ver el 100% del álbum desde el primer login
--   - Filtrar "tengo / me faltan" sin tener que tocar cada barajita
--   - Mostrar progreso real (ej: "0 de 670")
--
-- CÓMO ACTIVAR:
--   Opción A (recomendada): Llama a `init_coleccion_usuario(user_id)` desde
--     el trigger `on_auth_user_created` o desde tu endpoint de registro.
--   Opción B: El usuario pulsa "Inicializar mi colección" en el dashboard.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Función: inicializa cantidad=0 para todas las barajitas del álbum activo
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.init_coleccion_usuario(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_album_id uuid;
BEGIN
  -- Obtener el álbum activo
  SELECT id INTO v_album_id FROM public.albumes WHERE activo = true LIMIT 1;
  IF v_album_id IS NULL THEN
    RAISE NOTICE 'No hay álbum activo, se omite inicialización.';
    RETURN;
  END IF;

  -- Insertar cantidad=0 para cada barajita del álbum (ignora las que ya existen)
  INSERT INTO public.coleccion (user_id, barajita_id, cantidad)
  SELECT p_user_id, b.id, 0
  FROM public.barajitas b
  WHERE b.album_id = v_album_id
  ON CONFLICT (user_id, barajita_id) DO NOTHING;

  RAISE NOTICE 'Colección inicializada para usuario %: % barajitas con cantidad=0',
    p_user_id,
    (SELECT COUNT(*) FROM public.barajitas WHERE album_id = v_album_id);
END;
$$;

-- ----------------------------------------------------------------------------
-- OPCIÓN A: Modificar el trigger existente para llamar a init_coleccion_usuario
-- (Descomenta este bloque si quieres inicialización automática al registrarse)
-- ----------------------------------------------------------------------------

/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- 1. Crear perfil
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Inicializar colección con todas las barajitas en cantidad=0
  PERFORM public.init_coleccion_usuario(new.id);

  RETURN new;
END;
$$;
*/

-- ----------------------------------------------------------------------------
-- OPCIÓN B: Política RLS para que el propio usuario pueda llamar a la función
-- (La función ya tiene SECURITY DEFINER, se puede llamar desde el cliente)
-- ----------------------------------------------------------------------------

-- Permitir que usuarios autenticados llamen a la función vía RPC de Supabase:
-- En tu código Next.js:
--
--   const { error } = await supabase.rpc('init_coleccion_usuario', {
--     p_user_id: user.id
--   })
--
-- Agrega esto si quieres restringir que solo el propio usuario pueda inicializar:
REVOKE ALL ON FUNCTION public.init_coleccion_usuario(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.init_coleccion_usuario(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.init_coleccion_usuario(uuid) TO service_role;

-- ----------------------------------------------------------------------------
-- RESUMEN DEL FLUJO COMPLETO
-- ----------------------------------------------------------------------------
--
-- 1. Usuario se registra → trigger crea fila en `profiles`
--    (La colección empieza VACÍA a menos que actives la Opción A)
--
-- 2. Usuario va a "Mi Colección" → ve todas las barajitas del álbum
--    Las que NO tienen fila en `coleccion` se muestran como "buscando"
--    Las que tienen cantidad=1 → "tengo"
--    Las que tienen cantidad>1 → "tengo + repetidas para intercambiar"
--
-- 3. Usuario pulsa [+] en una barajita:
--    → Si no existe fila: INSERT cantidad=1
--    → Si ya existe: UPDATE cantidad = cantidad + 1
--    → Si llega a 0: mantener fila o borrarla (ambas opciones son válidas)
--
-- 4. En "Buscar intercambios" (comparar):
--    Se compara la colección de dos usuarios:
--    - Tú tienes repetida X → el otro la busca = ¡match de intercambio!
--
-- ============================================================================
