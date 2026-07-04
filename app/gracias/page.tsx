import Link from 'next/link';
import type { Metadata } from 'next';
import { ProductGrid } from '@/components/ProductGrid';
import { listProducts } from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: 'Pedido enviado',
  robots: { index: false },
};

export default async function GraciasPage() {
  const featured = await listProducts({ featured: true, limit: 4 });

  return (
    <div className="container-page pt-16 pb-28">
      {/* Confirmation */}
      <div className="max-w-xl mx-auto text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-accent text-primary">
          <CheckIcon className="h-9 w-9" />
        </div>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">
          ¡Pedido enviado!
        </h1>
        <p className="mt-4 text-ink-600 text-pretty text-lg">
          WhatsApp se abrió con tu pedido listo. Un asesor de Dapa Home lo confirmará en breve y te dará los detalles de pago y entrega.
        </p>

        <div className="mt-8 rounded-2xl bg-surface border border-ink-200/60 p-6 text-left space-y-3">
          <Step n={1} text="Envía el mensaje en WhatsApp (ya está pre-escrito)." />
          <Step n={2} text="Te confirmamos disponibilidad y forma de pago." />
          <Step n={3} text="Coordinamos la entrega o retiro en oficina." />
        </div>

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link href="/catalogo" className="btn btn-primary">
            Seguir comprando
            <ArrowIcon className="h-4 w-4" />
          </Link>
          <Link href="/" className="btn">
            Ir al inicio
          </Link>
        </div>
      </div>

      {/* Upsell */}
      {featured.length > 0 && (
        <section className="mt-20 pt-16 border-t border-ink-200/60">
          <div className="mb-8 text-center">
            <div className="label">Mientras tanto</div>
            <h2 className="mt-2 font-display text-3xl tracking-tight">
              También te puede interesar
            </h2>
          </div>
          <ProductGrid products={featured} className="grid gap-x-4 gap-y-10 grid-cols-2 lg:grid-cols-4" />
        </section>
      )}
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-primary text-white text-xs font-semibold">
        {n}
      </span>
      <p className="text-sm text-ink-700">{text}</p>
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" {...props}>
      <path d="m5 13 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
