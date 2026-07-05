import Link from 'next/link';
import Image from 'next/image';
import { ProductGrid } from '@/components/ProductGrid';
import { CategoryPills } from '@/components/CategoryPills';
import { Reveal } from '@/components/motion/Reveal';
import { Enter } from '@/components/motion/Enter';
import { Magnetic } from '@/components/motion/Magnetic';
import {
  getCategories,
  getSettings,
  listInstallations,
  listProducts,
  listTestimonials,
  imageUrl,
} from '@/lib/supabase/queries';

export const revalidate = 60;

export default async function HomePage() {
  const [settings, categories, featured, latest, installationsDb, testimonials] = await Promise.all([
    getSettings(),
    getCategories(),
    listProducts({ featured: true, limit: 4 }),
    listProducts({ limit: 8 }),
    listInstallations(),
    listTestimonials(),
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
                className="object-cover opacity-55 animate-kenburns"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900/70 via-ink-900/40 to-transparent" aria-hidden />

            <div className="relative px-6 py-16 md:px-14 md:py-24 lg:py-28 max-w-3xl">
              <Enter delay={0}>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                  {settings.hero.eyebrow}
                </span>
              </Enter>
              <Enter delay={0.08}>
                <h1 className="mt-5 font-display text-4xl md:text-6xl lg:text-7xl font-medium leading-[0.98] tracking-tight text-balance">
                  {settings.hero.title}
                </h1>
              </Enter>
              <Enter delay={0.16}>
                <p className="mt-5 max-w-xl text-base md:text-lg text-white/80 text-pretty">
                  {settings.hero.subtitle}
                </p>
              </Enter>
              <Enter delay={0.24}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Magnetic>
                    <Link href="/catalogo" className="btn bg-white text-ink-900 hover:bg-accent">
                      Ver catálogo
                      <ArrowIcon className="h-4 w-4" />
                    </Link>
                  </Magnetic>
                  <Magnetic>
                    <a
                      href={`https://wa.me/${settings.whatsapp.number}`}
                      target="_blank"
                      rel="noopener"
                      className="btn border border-white/30 text-white hover:bg-white/10"
                    >
                      <WhatsAppIcon className="h-4 w-4" /> Hablar por WhatsApp
                    </a>
                  </Magnetic>
                </div>
              </Enter>
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
        <Reveal className="flex items-end justify-between mb-6">
          <div>
            <div className="label">Comprar por categoría</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl tracking-tight">
              Encuentra tu estilo
            </h2>
          </div>
          <Link href="/catalogo" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium hover:text-primary">
            Ver todo <ArrowIcon className="h-3.5 w-3.5" />
          </Link>
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((c, i) => {
            const sample = [...featured, ...latest].find((p) => p.category?.slug === c.slug && p.images?.[0]);
            const tints = [
              'bg-[#E8EDE5]',
              'bg-[#F3DDD3]',
              'bg-[#E2DED4]',
              'bg-[#DDE5E3]',
            ];
            return (
              <Reveal key={c.id} delay={i * 0.06}>
                <Link
                  href={`/catalogo/${c.slug}`}
                  className={`group relative overflow-hidden rounded-2xl ${sample ? '' : tints[i % tints.length]} p-5 aspect-[5/6] flex flex-col justify-between transition-transform hover:-translate-y-1`}
                >
                  {sample?.images?.[0] && (
                    <>
                      <Image
                        src={imageUrl(sample.images[0].storage_path)}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-b from-ink-900/50 via-ink-900/10 to-ink-900/40"
                        aria-hidden
                      />
                    </>
                  )}
                  <div className="relative z-10">
                    <div className={`text-2xs uppercase tracking-wider ${sample ? 'text-white/70' : 'text-ink-600'}`}>0{i + 1}</div>
                    <div className={`mt-1 font-display text-2xl font-medium tracking-tight ${sample ? 'text-white' : 'text-ink-900'}`}>{c.name}</div>
                  </div>
                  <div
                    className={`relative z-10 self-end grid h-10 w-10 place-items-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                      sample ? 'bg-white/90 text-ink-900' : 'bg-ink-900 text-white'
                    }`}
                  >
                    <ArrowIcon className="h-4 w-4" />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ============== MÁS RECIENTES ============== */}
      <section className="container-page mb-20">
        <Reveal className="flex items-end justify-between mb-6">
          <div>
            <div className="label">Recién llegados</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl tracking-tight">Para descubrir</h2>
          </div>
        </Reveal>
        <ProductGrid products={latest.slice(0, 8)} className="grid gap-x-4 gap-y-8 grid-cols-2 lg:grid-cols-4" />
      </section>

      {/* ============== INSTALACIONES (LÁMPARAS EN EL MERCADO) ============== */}
      <section className="container-page mb-20">
        <Reveal className="flex items-end justify-between mb-6">
          <div>
            <div className="label">Galería</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl tracking-tight">
              Nuestras lámparas en el mercado
            </h2>
            <p className="mt-2 max-w-xl text-ink-600 text-pretty">
              Proyectos reales con clientes de Dapa Home: hogares, oficinas y comercios iluminados con nuestras piezas.
            </p>
          </div>
        </Reveal>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 [grid-auto-flow:dense]">
          {installations.map((item, i) => (
            <Reveal key={i} delay={(i % 5) * 0.05} y={16}>
              <figure
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
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============== TESTIMONIOS ============== */}
      {testimonials.length > 0 && (
        <section className="container-page mb-20">
          <Reveal className="mb-10">
            <div className="label">Clientes felices</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl tracking-tight">
              Lo que dicen de nosotros
            </h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.id} delay={i * 0.08}>
              <figure
                className="card p-6 flex flex-col gap-4 bg-surface rounded-2xl border border-ink-200/60"
              >
                <div className="flex gap-0.5" aria-label={`${t.rating} de 5 estrellas`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} filled={i < t.rating} />
                  ))}
                </div>
                <blockquote className="flex-1 text-ink-800 text-pretty leading-relaxed text-sm md:text-base">
                  &ldquo;{t.body}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3 pt-4 border-t border-ink-100">
                  {t.photo_path ? (
                    <Image
                      src={imageUrl(t.photo_path)}
                      alt={t.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-accent grid place-items-center text-primary font-display font-semibold text-sm flex-shrink-0">
                      {t.name[0]}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    {t.role && <div className="text-xs text-ink-600">{t.role}</div>}
                  </div>
                </figcaption>
              </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ============== CTA WHATSAPP ============== */}
      <section className="container-page mb-20">
        <Reveal className="relative overflow-hidden rounded-3xl bg-ink-900 text-white p-8 md:p-14">
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-secondary/30 blur-3xl" aria-hidden />
          <div className="absolute -bottom-16 -left-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" aria-hidden />
          <div className="relative max-w-2xl">
            <div className="label text-white/80">Para diseñadores y mayoristas</div>
            <h2 className="mt-3 font-display text-3xl md:text-5xl leading-[1.05] tracking-tight text-balance">
              ¿Proyecto a la vista? Hablamos y armamos tu pedido a la medida.
            </h2>
            <div className="mt-7 flex flex-wrap gap-3">
              <Magnetic>
                <a
                  href={`https://wa.me/${settings.whatsapp.number}?text=Hola%20Dapa%20Home%2C%20me%20interesa%20cotizar%20para%20un%20proyecto.`}
                  target="_blank"
                  rel="noopener"
                  className="btn bg-secondary text-white hover:brightness-110"
                >
                  <WhatsAppIcon className="h-4 w-4" /> Conversar por WhatsApp
                </a>
              </Magnetic>
              <Magnetic>
                <Link href="/sobre-nosotros#mayoristas" className="btn border border-white/30 text-white hover:bg-white/10">
                  Programa mayorista
                </Link>
              </Magnetic>
            </div>
          </div>
        </Reveal>
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

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
      <path
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.5}
        className={filled ? 'text-secondary' : 'text-ink-300'}
      />
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
