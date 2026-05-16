# 🎴 Intercambio de Barajitas

Plataforma web para registrar tu colección de barajitas, marcar las que tienes repetidas y las que te faltan, y encontrar otros usuarios con quien intercambiar.

Construida con **Next.js 14 (App Router)**, **Supabase** (auth + Postgres) y **Tailwind CSS**. Es totalmente responsiva (móvil y escritorio).

---

## ✨ Funcionalidades del MVP

- Registro e inicio de sesión con **Email/contraseña**, **Google** y **Facebook**.
- Catálogo de **álbumes** (solo uno activo a la vez; los demás quedan como historial).
- Vista de barajitas de un álbum, donde cada usuario marca cuántas tiene de cada una:
  - `0` = la busca
  - `1` = la tiene
  - `2+` = repetidas para intercambiar
- **Dashboard** con progreso de tu álbum.
- **Lista de usuarios** que también coleccionan el álbum activo.
- **Comparador**: entra al perfil de otro usuario y ve en un vistazo qué le puedes dar y qué te puede dar.
- Botón directo a **WhatsApp** del usuario para coordinar el intercambio.

---

## 🚀 Recomendación de infraestructura (mi sugerencia)

| Servicio | Para qué | Plan gratuito | Por qué |
|---|---|---|---|
| **Vercel** | Hosting de la app Next.js | ✅ Sí | Deploy automático con cada `git push`. Optimizado para Next.js. SSL gratis. |
| **Supabase** | Base de datos PostgreSQL + Auth + Storage | ✅ 500 MB DB, 50.000 usuarios | Te ahorra construir backend. Auth con OAuth incluido. |
| **GitHub** | Repositorio de código | ✅ Sí | Conecta con Vercel para CI/CD automático. |

**Costo total para arrancar: $0.** Solo pagas si superas el plan gratis (cuando tu app sea exitosa).

---

## 📋 Setup paso a paso

### 1. Requisitos previos

- [Node.js 20+](https://nodejs.org)
- Cuenta gratuita en [GitHub](https://github.com), [Vercel](https://vercel.com) y [Supabase](https://supabase.com)

### 2. Crear el proyecto en Supabase

1. Entra a [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Asigna nombre, password de la BD y región (elige la más cercana a tus usuarios).
3. Espera 1-2 minutos a que se aprovisione.
4. Ve a **SQL Editor** → **New query**.
5. Pega el contenido de [`supabase/schema.sql`](./supabase/schema.sql) y ejecuta. Esto crea tablas, vistas, políticas RLS y un álbum de muestra con 50 barajitas.
6. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public` key

### 3. Configurar autenticación

En tu proyecto Supabase, ve a **Authentication → Providers**:

**Email (ya viene activado)** — solo desactiva "Confirm email" durante desarrollo si quieres acelerar.

**Google OAuth:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Crea unas credenciales OAuth 2.0 (tipo Web application).
3. En "Authorized redirect URIs" añade: `https://TU-PROYECTO.supabase.co/auth/v1/callback`.
4. Copia `Client ID` y `Client secret` en Supabase → Authentication → Providers → Google.

**Facebook OAuth:**
1. Ve a [Facebook Developers](https://developers.facebook.com/apps) → Create App (tipo Consumer).
2. Añade el producto "Facebook Login".
3. En "Valid OAuth Redirect URIs" añade: `https://TU-PROYECTO.supabase.co/auth/v1/callback`.
4. Copia `App ID` y `App secret` en Supabase → Authentication → Providers → Facebook.

En **Authentication → URL Configuration**, añade tu dominio (`http://localhost:3000` en dev y tu dominio de producción).

### 4. Correr localmente

```bash
# 1. Clonar
git clone <tu-repo>
cd IntercambioBarajitas

# 2. Instalar dependencias
npm install

# 3. Variables de entorno
cp .env.local.example .env.local
# Edita .env.local con tus claves de Supabase

# 4. Arrancar dev server
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### 5. Deploy a producción (Vercel)

1. Sube el proyecto a GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/intercambio-barajitas.git
   git push -u origin main
   ```

2. Entra a [vercel.com/new](https://vercel.com/new) → **Import** el repo.

3. En "Environment Variables" añade:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (ej: `https://intercambio-barajitas.vercel.app`)

4. **Deploy**. En ~2 minutos estará online con HTTPS gratis.

5. Vuelve a Supabase → Authentication → URL Configuration y agrega tu URL de Vercel a `Site URL` y `Redirect URLs`.

6. Cada `git push` a `main` desplegará automáticamente la nueva versión.

---

## 🗂️ Estructura del proyecto

```
.
├── README.md                     ← este archivo
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── middleware.ts                 ← protege rutas privadas
├── .env.local.example
├── supabase/
│   └── schema.sql                ← ¡ejecuta esto en Supabase!
└── src/
    ├── app/
    │   ├── layout.tsx            ← navbar + estilos globales
    │   ├── page.tsx              ← landing pública
    │   ├── login/page.tsx
    │   ├── register/page.tsx
    │   ├── auth/callback/route.ts ← callback OAuth
    │   ├── dashboard/page.tsx    ← resumen del usuario
    │   ├── albumes/
    │   │   ├── page.tsx          ← lista de álbumes
    │   │   └── [id]/page.tsx     ← detalle + barajitas
    │   ├── mi-coleccion/page.tsx ← gestión de mis barajitas
    │   └── comparar/
    │       ├── page.tsx          ← lista de otros usuarios
    │       └── [userId]/page.tsx ← comparador 1 a 1
    ├── components/
    │   ├── Navbar.tsx
    │   ├── NavbarClient.tsx
    │   ├── LoginForm.tsx
    │   ├── RegisterForm.tsx
    │   └── BarajitasGrid.tsx     ← grid con filtros y +/-
    └── lib/
        ├── types.ts
        └── supabase/
            ├── client.ts         ← cliente para componentes "use client"
            ├── server.ts         ← cliente para Server Components
            └── middleware.ts     ← refresca sesión en cada request
```

---

## 🧑‍💼 Cómo administras la app

Como por ahora no hay panel admin, gestionas álbumes y barajitas desde el **SQL Editor** de Supabase. Ejemplos:

**Cargar un nuevo álbum (lo deja activo y desactiva los demás):**
```sql
update public.albumes set activo = false where activo = true;
insert into public.albumes (nombre, descripcion, total_barajitas, activo)
values ('Copa América 2027', 'Álbum oficial', 480, true);
```

**Cargar las barajitas de ese álbum:**
```sql
insert into public.barajitas (album_id, numero, nombre, equipo, rareza)
select id, '1', 'Lionel Messi', 'Argentina', 'legendaria' from public.albumes where nombre = 'Copa América 2027';
-- ... etc, o haz un INSERT masivo
```

**Cambiar qué álbum es el activo:**
```sql
update public.albumes set activo = false where activo = true;
update public.albumes set activo = true where nombre = 'Mundial 2026';
```

> 💡 Más adelante puedes construir un panel `/admin` protegido por rol para hacer esto desde la UI.

---

## 🛣️ Próximos pasos sugeridos

- **Panel de administración** para CRUD de álbumes y barajitas sin SQL.
- **Imágenes de las barajitas** (subir a Supabase Storage).
- **Sistema de mensajes interno** entre usuarios.
- **Filtros geográficos** (mostrar usuarios cercanos primero).
- **Sistema de reputación** o reviews de intercambios completados.
- **PWA** para que se instale como app en el celular.

---

## 📄 Licencia

MIT — úsalo como quieras.
