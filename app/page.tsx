import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/components/ProductCard';
import { CategoryPills } from '@/components/CategoryPills';
import {
  getCategories,
  getSettings,
  listInstallations,
  listProducts,
  imageUrl,
} from '@/lib/supabase/queries';

export const revalidate = 60;

export default async function HomePage() {
  const [settings, categories, featured, latest, installationsDb] = await Promise.all([
    getSettings(),
    getCategories(),
    listProducts({ featured: true, limit: 4 }),
    listProducts({ limit: 8 }),
    listInstallations(),
  ]);

  const installations = installationsDb.length
    ? installationsDb.map((it) => ({
        src: imageUrl(it.storage_path),
        alt: it.alt ?? '',
        caption: it.caption ?? '',
      }))
    : INSTALACIONES_FALLBACK;

  return (
    <>
      {/* ============== HERO ============== */}
      <section className="relative">
        <div className="container-page pt-6 pb-12">
          <div className="relative overflow-hidden rounded-3xl bg-ink-900 text-white">
            <div className="absolute inset-0 bg-warm-mesh opacity-80" aria-hidden />
            {featured[0]?.images?.[0] && (
              <Image
                src={imageUrl(featured[0].images[0].storage_path)}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-40"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900/85 via-ink-900/60 to-transparent" aria-hidden />

            <div className="relative px-6 py-16 md:px-14 md:py-24 lg:py-28 max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                {settings.hero.eyebrow}
              </span>
              <h1 className="mt-5 font-display text-4xl md:text-6xl lg:text-7xl font-medium leading-[0.98] tracking-tight text-balance">
                {settings.hero.title}
              </h1>
              <p className="mt-5 max-w-xl text-base md:text-lg text-white/80 text-pretty">
                {settings.hero.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/catalogo" className="btn bg-white text-ink-900 hover:bg-accent">
                  Ver catálogo
                  <ArrowIcon className="h-4 w-4" />
                </Link>
                <a
                  href={`https://wa.me/${settings.whatsapp.number}`}
                  target="_blank"
                  rel="noopener"
                  className="btn border border-white/30 text-white hover:bg-white/10"
                >
                  <WhatsAppIcon className="h-4 w-4" /> Hablar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== BARRA DE CATEGORÍAS ============== */}
      <section className="container-page">
        <CategoryPills categories={categories} />
      </section>

      {/* ============== CATEGORÍAS DESTACADAS (cards visuales) ============== */}
      <section className="container-page mt-8 mb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="label">Comprar por categoría</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl tracking-tight">
              Encuentra tu estilo
            </h2>
          </div>
          <Link href="/catalogo" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium hover:text-primary">
            Ver todo <ArrowIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((c, i) => {
            const sample = latest.find((p) => p.category?.slug === c.slug);
            const tints = [
              'bg-[#E8EDE5]',
              'bg-[#F3DDD3]',
              'bg-[#E2DED4]',
              'bg-[#DDE5E3]',
            ];
            return (
              <Link
                key={c.id}
                href={`/catalogo/${c.slug}`}
                className={`group relative overflow-hidden rounded-2xl ${tints[i % tints.length]} p-5 aspect-[5/6] flex flex-col justify-between transition-transform hover:-translate-y-1`}
              >
                <div>
                  <div className="text-2xs uppercase tracking-wider text-ink-600">0{i + 1}</div>
                  <div className="mt-1 font-display text-2xl font-medium tracking-tight">{c.name}</div>
                </div>
                {sample?.images?.[0] && (
                  <div className="relative w-full aspect-[4/3] self-end">
                    <Image
                      src={imageUrl(sample.images[0].storage_path)}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-ink-900 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowIcon className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============== MÁS RECIENTES ============== */}
      <section className="container-page mb-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="label">Recién llegados</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl tracking-tight">Para descubrir</h2>
          </div>
        </div>
        <div className="grid gap-x-4 gap-y-8 grid-cols-2 lg:grid-cols-4">
          {latest.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ============== INSTALACIONES (LÁMPARAS EN EL MERCADO) ============== */}
      <section className="container-page mb-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="label">Galería</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl tracking-tight">
              Nuestras lámparas en el mercado
            </h2>
            <p className="mt-2 max-w-xl text-ink-600 text-pretty">
              Proyectos reales con clientes de Dapa Home: hogares, oficinas y comercios iluminados con nuestras piezas.
            </p>
          </div>
        </div>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 [grid-auto-flow:dense]">
          {installations.map((item, i) => (
            <figure
              key={i}
              className={`relative overflow-hidden rounded-2xl bg-ink-100 ${
                i % 5 === 0 ? 'md:col-span-2 md:row-span-2 aspect-square' : 'aspect-[4/5]'
              }`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
              {item.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/70 to-transparent p-3 text-xs text-white">
                  {item.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </section>

      {/* ============== CTA WHATSAPP ============== */}
      <section className="container-page mb-20">
        <div className="relative overflow-hidden rounded-3xl bg-primary text-white p-8 md:p-14">
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-secondary/30 blur-3xl" aria-hidden />
          <div className="absolute -bottom-16 -left-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" aria-hidden />
          <div className="relative max-w-2xl">
            <div className="label text-white/80">Para diseñadores y mayoristas</div>
            <h2 className="mt-3 font-display text-3xl md:text-5xl leading-[1.05] tracking-tight text-balance">
              ¿Proyecto a la vista? Hablamos y armamos tu pedido a la medida.
            </h2>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${settings.whatsapp.number}?text=Hola%20Dapa%20Home%2C%20me%20interesa%20cotizar%20para%20un%20proyecto.`}
                target="_blank"
                rel="noopener"
                className="btn bg-secondary text-white hover:brightness-110"
              >
                <WhatsAppIcon className="h-4 w-4" /> Conversar por WhatsApp
              </a>
              <Link href="/sobre-nosotros#mayoristas" className="btn border border-white/30 text-white hover:bg-white/10">
                Programa mayorista
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const INSTALACIONES_FALLBACK: { src: string; alt: string; caption?: string }[] = [
  { src: '/instalaciones/placeholder.svg', alt: 'Lámpara colgante instalada en sala', caption: 'Sala — Quito' },
  { src: '/instalaciones/placeholder.svg', alt: 'Lámpara de mesa en dormitorio', caption: 'Dormitorio — Cumbayá' },
  { src: '/instalaciones/placeholder.svg', alt: 'Aplique de pared en pasillo', caption: 'Pasillo — Guayaquil' },
  { src: '/instalaciones/placeholder.svg', alt: 'Lámpara de pie en oficina', caption: 'Oficina — Quito' },
  { src: '/instalaciones/placeholder.svg', alt: 'Lámpara colgante sobre comedor', caption: 'Comedor — Cuenca' },
  { src: '/instalaciones/placeholder.svg', alt: 'Lámpara colgante en restaurante', caption: 'Restaurante — Quito' },
  { src: '/instalaciones/placeholder.svg', alt: 'Lámparas en cafetería', caption: 'Cafetería — Quito' },
];

function ArrowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.93.55 3.81 1.6 5.45L2 22l4.79-1.7a9.86 9.86 0 0 0 5.25 1.5h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.13-2.9-7C17.18 3.03 14.69 2 12.04 2Z" />
    </svg>
  );
}
