import { getSettings } from '@/lib/supabase/queries';
import { CartView } from '@/components/CartView';

export const metadata = { title: 'Carrito' };

export default async function CartPage() {
  const settings = await getSettings();
  return (
    <div className="container-page pt-12 pb-24">
      <header className="border-b border-ink-200/60 pb-6">
        <div className="label">Finalizar pedido</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl tracking-tight">Tu carrito</h1>
        <p className="mt-3 max-w-2xl text-ink-600 text-pretty">
          Revisa tu selección, completa tus datos y enviaremos un mensaje listo por WhatsApp para
          confirmar tu pedido.
        </p>
      </header>
      <CartView settings={settings} />
    </div>
  );
}
