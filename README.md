# Dapa Home — Catálogo Dinámico

Catálogo tipo ecommerce con checkout por WhatsApp. Frontend en **Next.js 15** + **Supabase** (Postgres, Auth, Storage). Diseño basado en el sistema **Gradient** adaptado a la marca Dapa Home (paleta terracotta/plum, tipografía Fraunces + Manrope).

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS con tokens del sistema de diseño
- Supabase (Postgres, RLS, Auth, Storage)
- Zustand para el carrito (persistido en localStorage)
- React Hook Form + Zod (formularios del admin)

## Estructura

```
app/
  page.tsx                  Home con hero, categorías destacadas, productos featured
  catalogo/                 Listado + categoría
  producto/[slug]/          Detalle con galería + variantes
  carrito/                  Checkout que arma mensaje de WhatsApp
  sobre-nosotros/
  admin/                    Panel privado (login con Supabase Auth)
    login/
    productos/[id]/         Editor con imágenes y variantes
    categorias/
    configuracion/          WhatsApp, plantilla de mensaje, hero copy
components/
  ProductCard, ProductDetail, CartDrawer, CatalogFilters, SiteHeader, SiteFooter
  admin/AdminImageManager, admin/AdminVariantManager, AdminShell
lib/
  supabase/                 client, server, queries, types, guard
  cart/store.ts             Zustand store
  whatsapp/buildMessage.ts  Genera el mensaje formateado
  format.ts, cn.ts
supabase/
  migrations/0001_init.sql  Esquema + RLS + bucket de Storage
  seed.sql                  Datos de demo
```

## Setup

### 1. Crear proyecto en Supabase
1. Ve a https://supabase.com → New project.
2. Copia `Project URL`, `anon key` y `service_role key`.

### 2. Variables de entorno
Copia `.env.local.example` a `.env.local` y completa:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_WHATSAPP_NUMBER=593XXXXXXXXX
```

### 3. Migrar base de datos
Pega el contenido de `supabase/migrations/0001_init.sql` en el **SQL Editor** de Supabase y ejecuta. Opcionalmente pega `supabase/seed.sql` para datos de prueba.

### 4. Crear usuario admin
En Supabase → Authentication → Users → **Add user**. Luego en el SQL editor:

```sql
update auth.users
set raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{role}', '"admin"')
where email = 'tu@correo.com';
```

### 5. Instalar y correr

```bash
npm install
npm run dev
```

Abre http://localhost:3000 y http://localhost:3000/admin/login.

## Verificación end-to-end

1. Login en `/admin/login` con tu usuario admin.
2. `/admin/productos/new` → crear producto, subir 1–3 imágenes, agregar variantes, marcar **Publicado**.
3. Visitar `/producto/<slug>` como anónimo → agregar al carrito.
4. `/carrito` → llenar nombre, ciudad → "Finalizar por WhatsApp" → debe abrirse WhatsApp con el mensaje formateado.
5. Cerrar sesión → intentar `/admin` → redirige a login.

## Despliegue

- **Frontend:** Vercel (importa el repo, agrega las variables de entorno, deploy).
- **DB/Storage:** Supabase Cloud (ya activo desde el setup).
- Asegúrate que el dominio de Supabase Storage esté permitido en `next.config.mjs` (ya configurado vía `NEXT_PUBLIC_SUPABASE_URL`).

## Checklist de calidad

- [ ] Contraste de texto ≥ 4.5:1.
- [ ] Focus visible en todos los elementos interactivos.
- [ ] Touch targets ≥ 44px.
- [ ] `alt` en todas las imágenes.
- [ ] Carrito persiste tras refresh.
- [ ] Mensaje de WhatsApp se abre en móvil y desktop.
- [ ] Admin requiere sesión + rol `admin`.

## Próximos pasos sugeridos

- Importar productos desde Odoo vía CSV.
- Webhook de revalidación al editar producto.
- Pasarela de pagos (Datafast / Kushki) cuando estés listo.
