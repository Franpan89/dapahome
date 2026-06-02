'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useCart, cartTotals, cartItemKey, type CustomerData } from '@/lib/cart/store';
import { formatMoney, TAX_LABEL, taxAmount, withTax, DELIVERY_FEE, PICKUP_ADDRESS } from '@/lib/format';
import { buildWhatsAppMessage, whatsappHref } from '@/lib/whatsapp/buildMessage';
import type { SiteSettings } from '@/lib/supabase/types';

export function CartView({ settings }: { settings: SiteSettings }) {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);
  const clear = useCart((s) => s.clear);
  const customer = useCart((s) => s.customer);
  const setCustomer = useCart((s) => s.setCustomer);
  const { subtotal, count } = cartTotals(items);

  const [touched, setTouched] = useState({ name: false, city: false });

  const errors = validate(customer);
  const isValid = Object.values(errors).every((e) => !e);

  const shippingFee = customer.delivery === 'delivery' ? DELIVERY_FEE : 0;
  const iva = taxAmount(subtotal);
  const total = withTax(subtotal) + shippingFee;

  const previewMsg = useMemo(
    () =>
      buildWhatsAppMessage({
        items,
        data: customer,
        template: settings.checkout_template,
      }),
    [items, customer, settings],
  );

  const href = whatsappHref(settings.whatsapp.number, previewMsg);

  if (count === 0) {
    return (
      <div className="mt-12 grid place-items-center text-center gap-3 rounded-xl border border-dashed border-ink-200 py-20">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-accent text-primary">
          <BagIcon className="h-7 w-7" />
        </div>
        <p className="font-display text-2xl">Tu carrito está vacío</p>
        <p className="text-ink-600">Agrega productos para enviarlos por WhatsApp.</p>
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
                  {it.variantLabel && <div className="text-xs text-ink-600 mt-0.5">{it.variantLabel}</div>}
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
              <button
                type="button"
                onClick={() => setCustomer({ delivery: 'pickup' })}
                aria-pressed={customer.delivery === 'pickup'}
                className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                  customer.delivery === 'pickup'
                    ? 'border-ink-900 bg-ink-900 text-white'
                    : 'border-ink-200 hover:border-ink-400'
                }`}
              >
                <div className="font-medium">Retiro en oficina</div>
                <div className={`text-2xs ${customer.delivery === 'pickup' ? 'text-white/70' : 'text-ink-600'}`}>Sin costo</div>
              </button>
              <button
                type="button"
                onClick={() => setCustomer({ delivery: 'delivery' })}
                aria-pressed={customer.delivery === 'delivery'}
                className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                  customer.delivery === 'delivery'
                    ? 'border-ink-900 bg-ink-900 text-white'
                    : 'border-ink-200 hover:border-ink-400'
                }`}
              >
                <div className="font-medium">Envío a domicilio</div>
                <div className={`text-2xs ${customer.delivery === 'delivery' ? 'text-white/70' : 'text-ink-600'}`}>
                  + {formatMoney(DELIVERY_FEE)} recargo
                </div>
              </button>
            </div>
            {customer.delivery === 'pickup' && (
              <p className="mt-2 text-2xs text-ink-600">{PICKUP_ADDRESS} · coordinamos hora por WhatsApp.</p>
            )}
          </div>

          <div className="space-y-2 border-t border-ink-200/60 pt-4">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-ink-600">Subtotal</span>
              <span className="font-mono tabular-nums">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-ink-600">{TAX_LABEL}</span>
              <span className="font-mono tabular-nums">+ {formatMoney(iva)}</span>
            </div>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-ink-600">{customer.delivery === 'delivery' ? 'Envío' : 'Retiro en oficina'}</span>
              <span className="font-mono tabular-nums">
                {shippingFee > 0 ? `+ ${formatMoney(shippingFee)}` : 'Gratis'}
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-3 border-t border-ink-200/60">
              <span className="label">Total a pagar</span>
              <span className="font-mono text-2xl tabular-nums font-semibold">{formatMoney(total)}</span>
            </div>
            {customer.delivery === 'delivery' && (
              <p className="text-2xs text-ink-600">El recargo de envío cubre Cuenca. Otras ciudades se cotizan por WhatsApp.</p>
            )}
          </div>

          <div className="space-y-3 border-t border-ink-200/60 pt-5">
            <Field
              id="name"
              label="Nombre completo"
              required
              value={customer.name}
              onChange={(v) => setCustomer({ name: v })}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              error={touched.name ? errors.name : undefined}
              placeholder="María Pérez"
              autoComplete="name"
            />
            <Field
              id="city"
              label="Ciudad"
              required
              value={customer.city}
              onChange={(v) => setCustomer({ city: v })}
              onBlur={() => setTouched((t) => ({ ...t, city: true }))}
              error={touched.city ? errors.city : undefined}
              placeholder="Cuenca"
              autoComplete="address-level2"
            />
            <div>
              <label htmlFor="notes" className="label">Notas (opcional)</label>
              <textarea
                id="notes"
                value={customer.notes}
                onChange={(e) => setCustomer({ notes: e.target.value })}
                className="input mt-1.5 min-h-[88px]"
                placeholder="Color preferido, fecha de entrega…"
              />
            </div>
          </div>

          {isValid ? (
            <a href={href} target="_blank" rel="noopener" className="btn-primary w-full">
              <WhatsAppIcon className="h-4 w-4" /> Finalizar por WhatsApp
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setTouched({ name: true, city: true })}
              className="btn-primary w-full opacity-90"
              aria-disabled="true"
            >
              <WhatsAppIcon className="h-4 w-4" /> Completa tus datos
            </button>
          )}
          <p className="text-2xs text-ink-600 text-center">
            Se abrirá WhatsApp con tu pedido pre-formateado. Confirmamos disponibilidad y envío por chat.
          </p>

          <details className="text-xs text-ink-600 border-t border-ink-200/60 pt-4">
            <summary className="cursor-pointer hover:text-primary">Vista previa del mensaje</summary>
            <pre className="mt-3 whitespace-pre-wrap font-mono text-2xs bg-ink-100 p-3 rounded">{previewMsg}</pre>
          </details>
        </div>
      </aside>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  required,
  error,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`input mt-1.5 ${error ? 'border-danger focus:border-danger focus:ring-danger/15' : ''}`}
        placeholder={placeholder}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-2xs text-danger">{error}</p>
      )}
    </div>
  );
}

function validate(c: CustomerData): { name?: string; city?: string } {
  const errors: { name?: string; city?: string } = {};
  if (c.name.trim().length < 2) errors.name = 'Cuéntanos tu nombre.';
  if (c.city.trim().length < 2) errors.city = 'Necesitamos saber tu ciudad para coordinar el envío.';
  return errors;
}

function BagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
      <path d="M9 8a3 3 0 0 1 6 0" strokeLinecap="round" />
    </svg>
  );
}
function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.93.55 3.81 1.6 5.45L2 22l4.79-1.7a9.86 9.86 0 0 0 5.25 1.5h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.13-2.9-7C17.18 3.03 14.69 2 12.04 2Zm0 18.03h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-2.85 1.01.96-2.78-.2-.31a8.13 8.13 0 0 1-1.27-4.42c0-4.51 3.67-8.18 8.19-8.18 2.19 0 4.24.85 5.79 2.4a8.13 8.13 0 0 1 2.4 5.79c0 4.52-3.67 8.18-8.19 8.18Z" />
    </svg>
  );
}
