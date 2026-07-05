import Link from 'next/link';
import Image from 'next/image';
import { NewsletterForm } from '@/components/NewsletterForm';
import { getCategories } from '@/lib/supabase/queries';

export async function SiteFooter() {
  const categories = await getCategories();
  const catalogLinks: [string, string][] = [
    ['/catalogo', 'Todos los productos'],
    ...categories.slice(0, 4).map((c): [string, string] => [`/catalogo/${c.slug}`, c.name]),
  ];

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
          <Image
            src="/logo.png"
            alt="Dapa Home"
            width={160}
            height={160}
            className="h-20 w-auto"
          />
          <p className="mt-3 max-w-sm text-sm text-ink-600 text-pretty">
            Estudio y tienda de objetos para el hogar. Curaduría de iluminación, decoración y
            domótica con instalación a domicilio en Ecuador.
          </p>
          <div className="mt-6 max-w-sm">
            <NewsletterForm />
          </div>
        </div>
        <FooterCol title="Catálogo" links={catalogLinks} />
        <FooterCol title="Empresa" links={[
          ['/sobre-nosotros', 'Sobre nosotros'],
          ['/blog', 'Blog'],
          ['/sobre-nosotros#mayoristas', 'Mayoristas y diseñadores'],
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
        <a
          href="https://wa.me/593984886719"
          target="_blank"
          rel="noopener"
          className="font-mono hover:text-primary"
        >
          Sitio web diseñado por: Pancho Andrade
        </a>
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
