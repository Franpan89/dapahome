# Dapahome — Sitemap + Sistema de Diseño

**Stack:** Next.js 15.1.6 (App Router), React 19, Supabase (`@supabase/ssr`), Tailwind 3.4, Zustand (carrito), Framer Motion, react-hook-form + zod, Sonner.

---

## 1. Sitemap

### Sitio público
- **/** — Home: hero slideshow (editable desde admin), productos destacados, categorías (pills/cards), galería de instalaciones, testimonios
- **/catalogo** — Catálogo completo: búsqueda, orden (recientes/destacados/precio asc-desc), filtros, paginación
- **/catalogo/[categoria]** — Catálogo filtrado por categoría
- **/producto/[slug]** — Detalle de producto: imágenes, variantes/colores, relacionados
- **/carrito** — Carrito: revisión de items + datos → genera mensaje pre-armado para WhatsApp
- **/gracias** — Confirmación post-pedido (tras redirect a WhatsApp), muestra destacados, `noindex`
- **/blog** — Índice de blog
- **/blog/[slug]** — Detalle de post (markdown, cover, productos relacionados)
- **/sobre-nosotros** — Historia de marca, dirección/mapa, redes (IG/FB/WhatsApp)
- **/not-found** — 404 custom
- `/robots.ts`, `/sitemap.ts` — SEO generado
- `/api/search` — endpoint de búsqueda

### Admin (`requireAdmin()` + `AdminShell`)
- **/admin/login** — Login (layout split con panel gradiente)
- **/admin** — Dashboard: conteos de productos/categorías/instalaciones/destacados, actividad reciente
- **/admin/productos** — Listado: búsqueda, filtro por estado (activo/borrador/archivado), acciones masivas
- **/admin/productos/[id]** (y `/new`) — Editor de producto: imágenes, variantes, colores, estado
- **/admin/categorias** — Categorías: nombre, orden, imagen por categoría (home)
- **/admin/instalaciones** — Galería (fotos/video) mostrada en home
- **/admin/testimonios** — Testimonios: alta/orden/publicación
- **/admin/blog** — Listado de posts
- **/admin/blog/new**, **/admin/blog/[id]** — Crear/editar post (cover, productos relacionados, markdown)
- **/admin/newsletter** — Suscriptores: export CSV, borrado
- **/admin/configuracion** — WhatsApp (número/saludo), template de checkout, editor de hero slideshow, barra de promo (on/off, texto, link)

---

## 2. Sistema de diseño

### Paleta ("Soft Modern Boutique")
| Token | Valor | Uso |
|---|---|---|
| `--primary` | #1F4940 (verde esmeralda) | Marca principal |
| `--primary-soft` | #38665B | Variante / gradiente |
| `--secondary` | #FF6B47 (coral) | CTA secundario |
| `--secondary-soft` | #FF987C | Hover / variante |
| `--accent` | #EDE7DC (crema cálido) | Fondos suaves |
| `ink-100` | #F5F2EC | Fondo de página |
| `ink-900…50` | Escala neutra cálida | Textos / bordes |
| `--surface` | Blanco | Superficies |
| `--success` | #2F7158 | Estados OK |
| `--danger` | #C4402F | Errores |

Gradiente `brand-gradient` (primary → primary-soft) y fondo `warm-mesh` (radial).

### Tipografía
- Única fuente: **Montserrat** (variable), vía `next/font/google`, mapeada a `font-sans`, `font-display` y `font-mono`.
- `.font-display`: tracking -0.025em para títulos.
- Tamaños custom: `2xs` (0.75rem) y `xs` (0.8125rem) para labels/chips.

### Componentes (`components/`)
- **Layout:** `SiteHeader`, `SiteFooter`, `PromoBar`, `AdminShell`
- **Comercio:** `ProductCard`, `ProductGrid`, `ProductDetail`, `ProductLightbox`, `CartDrawer`/`LazyCartDrawer`, `CartView`
- **Catálogo:** `CatalogFilters`, `CatalogSearch`, `CatalogToolbar` (+ paginación), `CategoryPills`
- **Home/marketing:** `HeroSlideshow` (autoplay 6.5s, Ken Burns, respeta reduced-motion), `FloatingWhatsApp`, `NewsletterForm`
- **Motion (`components/motion/`):** `Enter`, `Magnetic`, `PageTransition`, `Reveal`
- **Admin:** `AdminColorManager`, `AdminImageManager`, `AdminVariantManager`, `AdminProductsBulk`/`AdminProductsToolbar`, `AdminCategoryImage`, `AdminInstallationsManager`, `AdminTestimonialsManager`, `AdminBlogCover`, `HeroSlidesForm`, `PromoBarForm`, `DeleteSubscriberButton`, `ExportCsvButton`

### Clases utilitarias (`globals.css`, `@layer components`)
- **Botones** (pill, `rounded-full`, min-height 44px): `.btn-primary`, `.btn-secondary`, `.btn-dark`, `.btn-outline`, `.btn-ghost`
- **Otros:** `.card` (rounded-2xl), `.chip` / `.chip-active`, `.input`, `.label` (uppercase 2xs), `.pill-nav` / `.pill-nav-active`
- **Sombras tintadas:** `shadow-lift`, `shadow-card`, `shadow-ring`
- **Animaciones:** `animate-rise`, `animate-float`, `animate-kenburns`

### Layout
- **Público:** PromoBar → SiteHeader → `<main>` (con `PageTransition`) → SiteFooter → CartDrawer (slide-over) → FloatingWhatsApp → Sonner toaster. Los settings se cargan server-side una vez en el root layout (`getSettings()`).
- **Admin:** shell mínimo + sidebar fija de 260px (`AdminShell`): Dashboard, Productos, Categorías, Instalaciones, Testimonios, Blog, Newsletter, Configuración, volver al sitio, logout. Auth validada por página con `requireAdmin()` (sin middleware global).

### Sistema de personalización (admin/configuración)
- Tabla `site_settings` (Supabase, key/value JSON): `whatsapp`, `checkout_template`, `hero`, `promo_bar`. Una server action genérica (`saveSettingAction`) persiste cada key.
- **Hero:** `hero.slides[]` con `{eyebrow, title, subtitle, image_path}`; editable en `HeroSlidesForm` (sube imágenes directo a Supabase Storage).
- **Promo bar:** `{enabled, text, link}`, global arriba del header.
- **Imágenes de categoría:** campo en tabla `categories`, editable por categoría, usado en tarjetas del home.
- **Instalaciones:** tabla `installations` (con `sort_order`), soporta foto y video.
- Cada cambio revalida el home (`revalidateHomeAction`): el admin no técnico controla hero, promo bar, imágenes de categoría y galería sin tocar código.
