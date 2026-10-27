import { getSettings } from '@/lib/supabase/queries';
import { CheckoutView } from '@/components/CheckoutView';

export const metadata = { title: 'Finalizar pago', robots: { index: false } };

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <div className="container-page pt-12 pb-24">
      <header className="border-b border-ink-200/60 pb-6">
        <div className="label">Paso 2 de 2</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl tracking-tight">Finalizar pago</h1>
      </header>
      <CheckoutView settings={settings} />
    </div>
  );
}
