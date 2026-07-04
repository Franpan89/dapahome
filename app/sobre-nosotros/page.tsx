import Link from 'next/link';

export const metadata = { title: 'Sobre Nosotros' };

// TODO: reemplaza por la dirección exacta de la tienda en Cuenca.
const STORE_ADDRESS = 'Cuenca, Ecuador';
const STORE_MAPS_QUERY = encodeURIComponent('Dapa Home, Cuenca, Ecuador');
const STORE_MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${STORE_MAPS_QUERY}`;

const SOCIALS = [
  { name: 'Instagram', handle: '@dapa_home.ec', href: 'https://instagram.com/dapa_home.ec', icon: InstagramIcon, tone: 'bg-[#FCE7DD] text-[#C03B6B]' },
  { name: 'Facebook',  handle: 'dapahome.ec',   href: 'https://facebook.com/dapahome.ec',   icon: FacebookIcon,  tone: 'bg-[#E0EAFF] text-[#1B6BFF]' },
  { name: 'WhatsApp',  handle: '+593 99 800 1894', href: 'https://wa.me/593998001894',     icon: WhatsAppIcon,  tone: 'bg-[#DCFCE7] text-[#1A8744]' },
];

export default function AboutPage() {
  return (
    <div className="container-page pt-12 pb-24">
      <div className="max-w-3xl">
        <div className="label">Estudio</div>
        <h1 className="mt-2 font-display text-5xl md:text-6xl tracking-tight text-balance">
          Diseño para el hogar, hecho con criterio.
        </h1>
        <p className="mt-6 text-lg text-ink-600 text-pretty">
          En Dapa Home <strong className="text-ink-900 font-medium">fabricamos luminarias personalizadas</strong> y{' '}
          <strong className="text-ink-900 font-medium">comercializamos maceteros hechos a medida</strong>, pensados
          para hogares y proyectos de diseño en Ecuador. Trabajamos cada pieza junto a artesanos locales
          para que se adapte a tu espacio, no al revés.
        </p>
        <p className="mt-4 text-lg text-ink-600 text-pretty">
          Complementamos nuestro catálogo con una selección curada de{' '}
          <strong className="text-ink-900 font-medium">domótica</strong>, que importamos a través de un
          proveedor aliado para que tengas todo lo que necesita tu hogar inteligente en un solo lugar.
        </p>

        <section id="mayoristas" className="mt-16 scroll-mt-24">
          <div className="label">Para diseñadores</div>
          <h2 className="mt-2 font-display text-3xl tracking-tight">Programa de aliados</h2>
          <p className="mt-3 text-ink-600">
            Si trabajas como diseñador(a) de interiores o arquitecto(a), ofrecemos cotizaciones por proyecto,
            fichas técnicas y un canal directo de WhatsApp con un asesor que entiende los tiempos y
            requerimientos de obra.
          </p>
        </section>

      </div>

      {/* ============== ENCUÉNTRANOS ============== */}
      <section id="encuentranos" className="mt-24 scroll-mt-24">
        <div className="max-w-3xl">
          <div className="label">Encuéntranos</div>
          <h2 className="mt-2 font-display text-4xl md:text-5xl tracking-tight text-balance">
            Visítanos o sigue nuestro día a día.
          </h2>
          <p className="mt-4 text-ink-600 text-pretty">
            Estamos en {STORE_ADDRESS}. Puedes pasar por nuestra tienda con cita previa por WhatsApp,
            o seguirnos en redes para descubrir lanzamientos y proyectos en vivo.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Mapa */}
          <div className="overflow-hidden rounded-3xl border border-ink-200/60 bg-surface">
            <div className="aspect-[16/10] w-full">
              <iframe
                title="Mapa de Dapa Home"
                src={`https://www.google.com/maps?q=${STORE_MAPS_QUERY}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
            <div className="flex items-center justify-between gap-4 p-5">
              <div>
                <div className="font-display text-lg font-semibold tracking-tight">Dapa Home</div>
                <div className="text-sm text-ink-600">{STORE_ADDRESS}</div>
              </div>
              <a
                href={STORE_MAPS_LINK}
                target="_blank"
                rel="noopener"
                className="btn-outline whitespace-nowrap"
              >
                Cómo llegar
                <ArrowIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Redes sociales */}
          <div className="space-y-3">
            {SOCIALS.map(({ name, handle, href, icon: Icon, tone }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener"
                className="group flex items-center gap-4 rounded-2xl border border-ink-200/60 bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-ink-900"
              >
                <span className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-base font-semibold tracking-tight">{name}</div>
                  <div className="text-sm text-ink-600 truncate">{handle}</div>
                </div>
                <ArrowIcon className="h-4 w-4 text-ink-400 transition-transform group-hover:translate-x-1 group-hover:text-ink-900" />
              </a>
            ))}

            <Link
              href="mailto:ventas@dapahome.ec"
              className="group flex items-center gap-4 rounded-2xl border border-ink-200/60 bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-ink-900"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink-50 text-ink-900">
                <MailIcon className="h-5 w-5" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-display text-base font-semibold tracking-tight">Email</div>
                <div className="text-sm text-ink-600 truncate">ventas@dapahome.ec</div>
              </div>
              <ArrowIcon className="h-4 w-4 text-ink-400 transition-transform group-hover:translate-x-1 group-hover:text-ink-900" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ArrowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13 22v-8h3l.5-4H13V7.5c0-1.2.3-2 2-2h2V2.2C16.6 2.1 15.4 2 14 2c-3 0-5 1.8-5 5.2V10H6v4h3v8h4Z" />
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
function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" strokeLinecap="round" />
    </svg>
  );
}
