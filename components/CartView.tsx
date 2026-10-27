'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart, cartTotals, cartItemKey } from '@/lib/cart/store';
import { formatMoney, TAX_LABEL, taxAmount, withTax, DELIVERY_FEE, PICKUP_ADDRESS } from '@/lib/format';

export function CartView() {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);
  const clear = useCart((s) => s.clear);
  const delivery = useCart((s) => s.customer.delivery);
  const setCustomer = useCart((s) => s.setCustomer);
  const { subtotal, count } = cartTotals(items);

  const isDelivery = delivery === 'delivery';
  const shippingFee = isDelivery ? DELIVERY_FEE : 0;
  const total = withTax(subtotal) + shippingFee;

  if (count === 0) {
    return (
      <div className="mt-12 grid place-items-center text-center gap-3 rounded-xl border border-dashed border-ink-200 py-20">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-accent text-primary">
          <BagIcon className="h-7 w-7" />
        </div>
        <p className="font-display text-2xl">Tu carrito está vacío</p>
        <p className="text-ink-600">Agrega productos para continuar con tu pedido.</p>
        <Link href="/catalogo" className="btn-primary mt-2">Explorar catálogo</Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] items-start">
      <section>
        <ul className="divide-y divide-ink-200/60 rounded-xl border border-ink-200/60 bg-surface">
          {items.map((it) => {
            const k = cartItemKey(it);
            return (
              <li key={k} className="flex gap-4 p-5">
                <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded bg-ink-100">
                  {it.imageUrl && <Image src={it.imageUrl} alt="" fill sizes="80px" className="object-cover" />}
                </div>
                <div className="flex-1">
                  <Link href={`/producto/${it.slug}`} className="font-display text-lg leading-tight hover:text-primary">
                    {it.name}
                  </Link>
                  {(it.variantLabel || it.colorLabel) && (
                    <div className="text-xs text-ink-600 mt-0.5">
                      {[it.variantLabel, it.colorLabel].filter(Boolean).join(' · ')}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-4">
                    <div className="inline-flex items-center rounded-md border border-ink-200">
                      <button onClick={() => setQty(k, it.quantity - 1)} className="h-9 w-9 grid place-items-center text-ink-600 hover:text-primary" aria-label="Reducir cantidad">−</button>
                      <span className="w-8 text-center text-sm tabular-nums">{it.quantity}</span>
                      <button onClick={() => setQty(k, it.quantity + 1)} className="h-9 w-9 grid place-items-center text-ink-600 hover:text-primary" aria-label="Aumentar cantidad">+</button>
                    </div>
                    <button onClick={() => remove(k)} className="text-xs text-danger hover:underline">Quitar</button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm tabular-nums">{formatMoney(it.unitPrice * it.quantity, it.currency)}</div>
                  <div className="text-2xs text-ink-600 mt-1">{formatMoney(it.unitPrice, it.currency)} c/u</div>
                </div>
              </li>
            );
          })}
        </ul>
        <button onClick={clear} className="mt-4 text-xs text-ink-600 hover:text-danger">Vaciar carrito</button>
      </section>

      <aside className="lg:sticky lg:top-24 self-start">
        <div className="card p-6 space-y-5">
          <div>
            <span className="label">Entrega</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <DeliveryOption
                active={delivery === 'pickup'}
                onClick={() => setCustomer({ delivery: 'pickup' })}
                title="Retiro en oficina"
                hint="Sin costo"
              />
              <DeliveryOption
                active={delivery === 'delivery'}
                onClick={() => setCustomer({ delivery: 'delivery' })}
                title="Envío a domicilio"
                hint={`${formatMoney(DELIVERY_FEE)} a nivel nacional`}
              />
            </div>
            {delivery === 'pickup' && (
              <p className="mt-2 text-2xs text-ink-600">{PICKUP_ADDRESS} · coordinamos hora por WhatsApp.</p>
            )}
          </div>

          <div className="space-y-2 border-t border-ink-200/60 pt-4">
            <Row label="Subtotal" value={formatMoney(subtotal)} />
            <Row label={TAX_LABEL} value={`+ ${formatMoney(taxAmount(subtotal))}`} />
            <Row
              label={isDelivery ? 'Envío' : 'Retiro en oficina'}
              value={shippingFee > 0 ? `+ ${formatMoney(shippingFee)}` : 'Gratis'}
            />
            <div className="flex items-baseline justify-between pt-3 border-t border-ink-200/60">
              <span className="label">Total a pagar</span>
              <span className="font-mono text-2xl tabular-nums font-semibold">{formatMoney(total)}</span>
            </div>
          </div>

          <Link href="/carrito/pago" className="btn-primary w-full">
            Continuar con el pago
          </Link>
        </div>
      </aside>
    </div>
  );
}

function DeliveryOption({
  active,
  onClick,
  title,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
        active ? 'border-ink-900 bg-ink-900 text-white' : 'border-ink-200 hover:border-ink-400'
      }`}
    >
      <div className="font-medium">{title}</div>
      <div className={`text-2xs ${active ? 'text-white/70' : 'text-ink-600'}`}>{hint}</div>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-ink-600">{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}

function BagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
      <path d="M9 8a3 3 0 0 1 6 0" strokeLinecap="round" />
    </svg>
  );
}
