import Link from 'next/link';
import { NewsletterForm } from '@/components/NewsletterForm';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink-200/60 bg-surface">
      <div className="container-page py-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-b border-ink-200/60">
        {[
          ['🚚', 'Envíos a nivel nacional'],
          ['💬', 'Asesoría real por WhatsApp'],
          ['🛠️', 'Instalación con técnico'],
          ['✨', 'Selección curada'],
        ].map(([icon, label]) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-50 text-base">{icon}</span>
            <span className="font-medium">{label}</span>
          </div>
        ))}
      </div>

      <div className="container-page py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="font-display text-2xl font-semibold tracking-tight">
            Dapa<span className="text-secondary">·</span>Home
          </div>
          <p className="mt-3 max-w-sm text-sm text-ink-600 text-pretty">
            Estudio y tienda de objetos para el hogar. Curaduría de iluminación, decoración y
            domótica con instalación a domicilio en Ecuador.
          </p>
          <div className="mt-6 max-w-sm">
            <NewsletterForm />
          </div>
        </div>
        <FooterCol title="Catálogo" links={[
          ['/catalogo', 'Todos los productos'],
          ['/catalogo/iluminacion', 'Iluminación'],
          ['/catalogo/decoracion', 'Decoración'],
          ['/catalogo/domotica', 'Domótica'],
          ['/catalogo/mobiliario', 'Mobiliario'],
        ]} />
        <FooterCol title="Empresa" links={[
          ['/sobre-nosotros', 'Sobre nosotros'],
          ['/blog', 'Blog'],
          ['/sobre-nosotros#mayoristas', 'Mayoristas'],
          ['/sobre-nosotros#diseno', 'Para diseñadores'],
        ]} />
        <FooterCol title="Contacto" links={[
          ['https://wa.me/593998001894', 'WhatsApp'],
          ['mailto:ventas@dapahome.ec', 'ventas@dapahome.ec'],
          ['https://instagram.com/dapa_home.ec', 'Instagram'],
          ['https://facebook.com/dapahome.ec', 'Facebook'],
        ]} />
      </div>
      <div className="container-page border-t border-ink-200/60 py-6 flex flex-col sm:flex-row gap-2 items-center justify-between text-2xs text-ink-600">
        <span>© {new Date().getFullYear()} Dapa Home · Hecho con cariño en Cuenca.</span>
        <span className="font-mono">v0.1 · catálogo dinámico</span>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="label mb-3">{title}</div>
      <ul className="space-y-2">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="text-sm text-ink-900/80 hover:text-primary">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
