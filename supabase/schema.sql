-- ============================================================================
-- IntercambioBarajitas - Esquema completo de base de datos
-- Ejecutar en Supabase > SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- Extensiones útiles
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. PERFILES (extensión de auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  ciudad text,
  whatsapp text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Crear perfil automáticamente cuando se registra un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. ÁLBUMES
-- ----------------------------------------------------------------------------
create table if not exists public.albumes (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  descripcion text,
  imagen_portada text,
  total_barajitas integer not null default 0,
  activo boolean not null default false,  -- Solo un álbum activo a la vez
  created_at timestamptz not null default now()
);

-- Garantiza un único álbum activo
create unique index if not exists albumes_un_solo_activo
  on public.albumes (activo) where activo = true;

-- ----------------------------------------------------------------------------
-- 3. BARAJITAS (catálogo del álbum)
-- ----------------------------------------------------------------------------
create table if not exists public.barajitas (
  id uuid primary key default uuid_generate_v4(),
  album_id uuid not null references public.albumes(id) on delete cascade,
  numero text not null,         -- "1", "FWC1", "23A"... acepta variantes
  nombre text,                  -- Ej: "Lionel Messi"
  equipo text,                  -- Ej: "Argentina"
  rareza text,                  -- "comun" | "rara" | "legendaria"
  imagen_url text,
  created_at timestamptz not null default now(),
  unique (album_id, numero)
);

create index if not exists barajitas_album_idx on public.barajitas (album_id);

-- ----------------------------------------------------------------------------
-- 4. COLECCIÓN DEL USUARIO (cuántas tiene de cada barajita)
-- ----------------------------------------------------------------------------
-- cantidad = 0 → no la tiene (la busca)
-- cantidad = 1 → la tiene (pegada)
-- cantidad > 1 → tiene repetidas (puede intercambiar cantidad-1)
create table if not exists public.coleccion (
  user_id uuid not null references auth.users(id) on delete cascade,
  barajita_id uuid not null references public.barajitas(id) on delete cascade,
  cantidad integer not null default 0 check (cantidad >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, barajita_id)
);

create index if not exists coleccion_user_idx on public.coleccion (user_id);
create index if not exists coleccion_barajita_idx on public.coleccion (barajita_id);

-- Vistas útiles para comparar intercambios
create or replace view public.coleccion_resumen as
select
  c.user_id,
  b.album_id,
  count(*) filter (where c.cantidad >= 1) as tiene,
  count(*) filter (where c.cantidad = 0)  as busca,
  coalesce(sum(greatest(c.cantidad - 1, 0)), 0) as repetidas
from public.coleccion c
join public.barajitas b on b.id = c.barajita_id
group by c.user_id, b.album_id;

-- ----------------------------------------------------------------------------
-- 5. POLÍTICAS DE SEGURIDAD (Row Level Security)
-- ----------------------------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.albumes   enable row level security;
alter table public.barajitas enable row level security;
alter table public.coleccion enable row level security;

-- PROFILES: todos leen, solo el dueño edita su perfil
drop policy if exists "perfiles visibles" on public.profiles;
create policy "perfiles visibles" on public.profiles
  for select using (true);

drop policy if exists "editar mi perfil" on public.profiles;
create policy "editar mi perfil" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "insertar mi perfil" on public.profiles;
create policy "insertar mi perfil" on public.profiles
  for insert with check (auth.uid() = id);

-- ALBUMES: todos pueden leer; solo admins escriben (via service role)
drop policy if exists "albumes visibles" on public.albumes;
create policy "albumes visibles" on public.albumes
  for select using (true);

-- BARAJITAS: todos pueden leer; admins las cargan via service role
drop policy if exists "barajitas visibles" on public.barajitas;
create policy "barajitas visibles" on public.barajitas
  for select using (true);

-- COLECCIÓN: todos pueden leer (para comparar), pero solo el dueño edita
drop policy if exists "coleccion visible" on public.coleccion;
create policy "coleccion visible" on public.coleccion
  for select using (true);

drop policy if exists "insertar mi coleccion" on public.coleccion;
create policy "insertar mi coleccion" on public.coleccion
  for insert with check (auth.uid() = user_id);

drop policy if exists "actualizar mi coleccion" on public.coleccion;
create policy "actualizar mi coleccion" on public.coleccion
  for update using (auth.uid() = user_id);

drop policy if exists "borrar mi coleccion" on public.coleccion;
create policy "borrar mi coleccion" on public.coleccion
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6. DATOS DE EJEMPLO (puedes borrarlos luego)
-- ----------------------------------------------------------------------------
insert into public.albumes (nombre, descripcion, total_barajitas, activo)
values ('Mundial 2026', 'Álbum oficial de la Copa del Mundo 2026', 670, true)
on conflict do nothing;

-- Generar algunas barajitas de muestra para el álbum activo
do $$
declare
  v_album_id uuid;
  i int;
begin
  select id into v_album_id from public.albumes where activo = true limit 1;
  if v_album_id is not null then
    for i in 1..50 loop
      insert into public.barajitas (album_id, numero, nombre, rareza)
      values (
        v_album_id,
        i::text,
        'Barajita ' || i,
        case when i % 25 = 0 then 'legendaria'
             when i % 7 = 0  then 'rara'
             else 'comun' end
      )
      on conflict do nothing;
    end loop;
  end if;
end $$;
