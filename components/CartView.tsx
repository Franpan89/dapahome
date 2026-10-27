'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, cartTotals, cartItemKey, effectiveBilling } from '@/lib/cart/store';
import { validateCustomer, type CustomerErrors } from '@/lib/checkout/validate';
import { formatMoney, TAX_LABEL, taxAmount, withTax, DELIVERY_FEE, PICKUP_ADDRESS } from '@/lib/format';
import { buildWhatsAppMessage, whatsappHref } from '@/lib/whatsapp/buildMessage';
import { PayphoneBox } from '@/components/PayphoneBox';
import type { SiteSettings } from '@/lib/supabase/types';

const PAYPHONE_TOKEN = process.env.NEXT_PUBLIC_PAYPHONE_TOKEN;
const PAYPHONE_STORE_ID = process.env.NEXT_PUBLIC_PAYPHONE_STORE_ID;

type PaymentMethod = 'whatsapp' | 'payphone';

interface PayphoneAmounts {
  clientTransactionId: string;
  amount: number;
  amountWithoutTax: number;
  amountWithTax: number;
  tax: number;
  reference: string;
  currency: string;
  phoneNumber: string;
  email: string;
  documentId: string;
  identificationType: number;
}

export function CartView({ settings }: { settings: SiteSettings }) {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);
  const clear = useCart((s) => s.clear);
  const customer = useCart((s) => s.customer);
  const setCustomer = useCart((s) => s.setCustomer);
  const { subtotal, count } = cartTotals(items);

  const router = useRouter();
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payphone');
  const [payphoneAmounts, setPayphoneAmounts] = useState<PayphoneAmounts | null>(null);
  const [payphoneStatus, setPayphoneStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [payphoneError, setPayphoneError] = useState<string | null>(null);

  const errors = validateCustomer(customer);
  const isValid = Object.keys(errors).length === 0;
  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));
  const err = (k: keyof CustomerErrors) => (touched[k] || submitted ? errors[k] : undefined);
  const billing = effectiveBilling(customer);

  const isDelivery = customer.delivery === 'delivery';
  const shippingFee = isDelivery ? DELIVERY_FEE : 0;
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

  const handleCheckout = useCallback(() => {
    window.open(href, '_blank', 'noopener,noreferrer');
    clear();
    router.push('/gracias');
  }, [href, clear, router]);

  // Si el carrito o los datos cambian después de generar el botón de PayPhone,
  // invalidamos el pedido pendiente para no cobrar un monto desactualizado.
  useEffect(() => {
    setPayphoneAmounts(null);
  }, [items, customer]);

  const handleCreatePayphoneOrder = useCallback(async () => {
    setPayphoneStatus('loading');
    setPayphoneError(null);
    try {
      const res = await fetch('/api/payphone/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'No se pudo generar el pago.');
      setPayphoneAmounts(data);
      setPayphoneStatus('idle');
    } catch (err) {
      setPayphoneStatus('error');
      setPayphoneError(err instanceof Error ? err.message : 'No se pudo generar el pago.');
    }
  }, [items, customer]);

  const payphoneEnabled = Boolean(PAYPHONE_TOKEN);

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
                  {formatMoney(DELIVERY_FEE)} a nivel nacional
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
              <span className="text-ink-600">{isDelivery ? 'Envío' : 'Retiro en oficina'}</span>
              <span className="font-mono tabular-nums">
                {shippingFee > 0 ? `+ ${formatMoney(shippingFee)}` : 'Gratis'}
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-3 border-t border-ink-200/60">
              <span className="label">Total a pagar</span>
              <span className="font-mono text-2xl tabular-nums font-semibold">{formatMoney(total)}</span>
            </div>
          </div>

          <div className="space-y-3 border-t border-ink-200/60 pt-5">
            <h3 className="label">Datos de envío</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field id="firstName" label="Nombres" required value={customer.firstName}
                onChange={(v) => setCustomer({ firstName: v })} onBlur={() => touch('firstName')}
                error={err('firstName')} placeholder="María" autoComplete="given-name" />
              <Field id="lastName" label="Apellidos" required value={customer.lastName}
                onChange={(v) => setCustomer({ lastName: v })} onBlur={() => touch('lastName')}
                error={err('lastName')} placeholder="Pérez" autoComplete="family-name" />
            </div>
            <Field id="phone" label="Celular" required type="tel" inputMode="tel" value={customer.phone}
              onChange={(v) => setCustomer({ phone: v })} onBlur={() => touch('phone')}
              error={err('phone')} placeholder="0998001894" autoComplete="tel" />
            <Field id="email" label="Correo electrónico" required type="email" inputMode="email" value={customer.email}
              onChange={(v) => setCustomer({ email: v })} onBlur={() => touch('email')}
              error={err('email')} placeholder="maria@correo.com" autoComplete="email" />
            <Field id="address" label="Dirección de envío" required value={customer.address}
              onChange={(v) => setCustomer({ address: v })} onBlur={() => touch('address')}
              error={err('address')} placeholder="Calle principal, número y secundaria" autoComplete="street-address" />
            <Field id="city" label="Ciudad" required value={customer.city}
              onChange={(v) => setCustomer({ city: v })} onBlur={() => touch('city')}
              error={err('city')} placeholder="Cuenca" autoComplete="address-level2" />
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

          <div className="space-y-3 border-t border-ink-200/60 pt-5">
            <h3 className="label">Datos de facturación</h3>
            <label className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
              <input
                type="checkbox"
                checked={customer.billingSame}
                onChange={(e) => setCustomer({ billingSame: e.target.checked })}
                className="h-4 w-4"
              />
              Usar los mismos datos del envío
            </label>
            <Field id="billingDocumentId" label="Cédula o RUC" required inputMode="numeric" value={customer.billingDocumentId}
              onChange={(v) => setCustomer({ billingDocumentId: v })} onBlur={() => touch('billingDocumentId')}
              error={err('billingDocumentId')} placeholder="0102030405" />
            <div className="grid grid-cols-2 gap-3">
              <Field id="billingFirstName" label="Nombres" required disabled={customer.billingSame}
                value={billing.firstName} onChange={(v) => setCustomer({ billingFirstName: v })}
                onBlur={() => touch('billingFirstName')} error={err('billingFirstName')} autoComplete="off" />
              <Field id="billingLastName" label="Apellidos" required disabled={customer.billingSame}
                value={billing.lastName} onChange={(v) => setCustomer({ billingLastName: v })}
                onBlur={() => touch('billingLastName')} error={err('billingLastName')} autoComplete="off" />
            </div>
            <Field id="billingPhone" label="Celular" required type="tel" inputMode="tel" disabled={customer.billingSame}
              value={billing.phone} onChange={(v) => setCustomer({ billingPhone: v })}
              onBlur={() => touch('billingPhone')} error={err('billingPhone')} autoComplete="off" />
            <Field id="billingEmail" label="Correo electrónico" required type="email" inputMode="email" disabled={customer.billingSame}
              value={billing.email} onChange={(v) => setCustomer({ billingEmail: v })}
              onBlur={() => touch('billingEmail')} error={err('billingEmail')} autoComplete="off" />
            <Field id="billingAddress" label="Dirección" required disabled={customer.billingSame}
              value={billing.address} onChange={(v) => setCustomer({ billingAddress: v })}
              onBlur={() => touch('billingAddress')} error={err('billingAddress')} autoComplete="off" />
          </div>

          {payphoneEnabled && (
            <div className="border-t border-ink-200/60 pt-4">
              <span className="label">Método de pago</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('payphone')}
                  aria-pressed={paymentMethod === 'payphone'}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                    paymentMethod === 'payphone'
                      ? 'border-ink-900 bg-ink-900 text-white'
                      : 'border-ink-200 hover:border-ink-400'
                  }`}
                >
                  <div className="font-medium">Pagar ahora</div>
                  <div className={`text-2xs ${paymentMethod === 'payphone' ? 'text-white/70' : 'text-ink-600'}`}>
                    Tarjeta vía PayPhone
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('whatsapp')}
                  aria-pressed={paymentMethod === 'whatsapp'}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                    paymentMethod === 'whatsapp'
                      ? 'border-ink-900 bg-ink-900 text-white'
                      : 'border-ink-200 hover:border-ink-400'
                  }`}
                >
                  <div className="font-medium">Coordinar por WhatsApp</div>
                  <div className={`text-2xs ${paymentMethod === 'whatsapp' ? 'text-white/70' : 'text-ink-600'}`}>
                    Transferencia o pago contra entrega
                  </div>
                </button>
              </div>
            </div>
          )}

          {!isValid ? (
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="btn-primary w-full opacity-90"
              aria-disabled="true"
            >
              Completa tus datos
            </button>
          ) : payphoneEnabled && paymentMethod === 'payphone' ? (
            <div className="space-y-3">
              {payphoneAmounts ? (
                <PayphoneBox
                  token={PAYPHONE_TOKEN!}
                  storeId={PAYPHONE_STORE_ID}
                  clientTransactionId={payphoneAmounts.clientTransactionId}
                  amount={payphoneAmounts.amount}
                  amountWithoutTax={payphoneAmounts.amountWithoutTax}
                  amountWithTax={payphoneAmounts.amountWithTax}
                  tax={payphoneAmounts.tax}
                  reference={payphoneAmounts.reference}
                  currency={payphoneAmounts.currency}
                  phoneNumber={payphoneAmounts.phoneNumber}
                  email={payphoneAmounts.email}
                  documentId={payphoneAmounts.documentId}
                  identificationType={payphoneAmounts.identificationType}
                />
              ) : (
                <button
                  type="button"
                  onClick={handleCreatePayphoneOrder}
                  disabled={payphoneStatus === 'loading'}
                  className="btn-primary w-full disabled:opacity-60"
                >
                  {payphoneStatus === 'loading' ? 'Generando pago…' : 'Pagar con tarjeta'}
                </button>
              )}
              {payphoneStatus === 'error' && payphoneError && (
                <p className="text-2xs text-danger text-center">{payphoneError}</p>
              )}
            </div>
          ) : (
            <button type="button" onClick={handleCheckout} className="btn-primary w-full">
              <WhatsAppIcon className="h-4 w-4" /> Finalizar por WhatsApp
            </button>
          )}
          <p className="text-2xs text-ink-600 text-center">
            {payphoneEnabled && paymentMethod === 'payphone'
              ? 'Pago seguro procesado por PayPhone. Te contactaremos para coordinar la entrega.'
              : 'Se abrirá WhatsApp con tu pedido pre-formateado. Confirmamos disponibilidad y envío por chat.'}
          </p>

          {!(payphoneEnabled && paymentMethod === 'payphone') && (
            <details className="text-xs text-ink-600 border-t border-ink-200/60 pt-4">
              <summary className="cursor-pointer hover:text-primary">Vista previa del mensaje</summary>
              <pre className="mt-3 whitespace-pre-wrap font-mono text-2xs bg-ink-100 p-3 rounded">{previewMsg}</pre>
            </details>
          )}
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
  type,
  inputMode,
  disabled,
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
  type?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        id={id}
        type={type ?? 'text'}
        inputMode={inputMode}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`input mt-1.5 disabled:opacity-60 disabled:cursor-not-allowed ${error ? 'border-danger focus:border-danger focus:ring-danger/15' : ''}`}
        placeholder={placeholder}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-2xs text-danger">{error}</p>
      )}
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
function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.93.55 3.81 1.6 5.45L2 22l4.79-1.7a9.86 9.86 0 0 0 5.25 1.5h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.13-2.9-7C17.18 3.03 14.69 2 12.04 2Zm0 18.03h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-2.85 1.01.96-2.78-.2-.31a8.13 8.13 0 0 1-1.27-4.42c0-4.51 3.67-8.18 8.19-8.18 2.19 0 4.24.85 5.79 2.4a8.13 8.13 0 0 1 2.4 5.79c0 4.52-3.67 8.18-8.19 8.18Z" />
    </svg>
  );
}
