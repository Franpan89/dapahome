'use client';

import Link from 'next/link';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, cartTotals, cartItemKey } from '@/lib/cart/store';
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

export function CheckoutView({ settings }: { settings: SiteSettings }) {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const customer = useCart((s) => s.customer);
  const setCustomer = useCart((s) => s.setCustomer);
  const { subtotal, count } = cartTotals(items);
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payphone');
  const [payphoneAmounts, setPayphoneAmounts] = useState<PayphoneAmounts | null>(null);
  const [payphoneStatus, setPayphoneStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [payphoneError, setPayphoneError] = useState<string | null>(null);

  useEffect(() => setHydrated(true), []);

  const errors = validateCustomer(customer);
  const isValid = Object.keys(errors).length === 0;
  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));
  const err = (k: keyof CustomerErrors) => (touched[k] || submitted ? errors[k] : undefined);

  const isDelivery = customer.delivery === 'delivery';
  const shippingFee = isDelivery ? DELIVERY_FEE : 0;
  const total = withTax(subtotal) + shippingFee;

  const previewMsg = useMemo(
    () => buildWhatsAppMessage({ items, data: customer, template: settings.checkout_template }),
    [items, customer, settings],
  );
  const href = whatsappHref(settings.whatsapp.number, previewMsg);

  const handleWhatsApp = useCallback(() => {
    // Registra el pedido para el panel admin sin retrasar la apertura de WhatsApp.
    fetch('/api/orders/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, customer }),
      keepalive: true,
    }).catch(() => {});
    window.open(href, '_blank', 'noopener,noreferrer');
    clear();
    router.push('/gracias');
  }, [href, items, customer, clear, router]);

  // Invalida el pedido pendiente de PayPhone si cambian el carrito o los datos.
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
    } catch (e) {
      setPayphoneStatus('error');
      setPayphoneError(e instanceof Error ? e.message : 'No se pudo generar el pago.');
    }
  }, [items, customer]);

  const payphoneEnabled = Boolean(PAYPHONE_TOKEN);
  const usePayphone = payphoneEnabled && paymentMethod === 'payphone';

  if (!hydrated) return <div className="mt-10 h-96" aria-hidden />;

  if (count === 0) {
    return (
      <div className="mt-12 grid place-items-center text-center gap-3 rounded-xl border border-dashed border-ink-200 py-20">
        <p className="font-display text-2xl">Tu carrito está vacío</p>
        <Link href="/catalogo" className="btn-primary mt-2">Explorar catálogo</Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr] items-start">
      <section className="space-y-6">
        <div className="card p-6">
          <h2 className="label">Datos de envío</h2>
          <div className="mt-4 grid gap-x-3 gap-y-3 sm:grid-cols-2">
            <Field id="firstName" label="Nombres" required value={customer.firstName}
              onChange={(v) => setCustomer({ firstName: v })} onBlur={() => touch('firstName')}
              error={err('firstName')} placeholder="María" autoComplete="given-name" />
            <Field id="lastName" label="Apellidos" required value={customer.lastName}
              onChange={(v) => setCustomer({ lastName: v })} onBlur={() => touch('lastName')}
              error={err('lastName')} placeholder="Pérez" autoComplete="family-name" />
            <Field id="phone" label="Celular" required type="tel" inputMode="tel" value={customer.phone}
              onChange={(v) => setCustomer({ phone: v })} onBlur={() => touch('phone')}
              error={err('phone')} placeholder="0998001894" autoComplete="tel" />
            <Field id="email" label="Correo electrónico" required type="email" inputMode="email" value={customer.email}
              onChange={(v) => setCustomer({ email: v })} onBlur={() => touch('email')}
              error={err('email')} placeholder="maria@correo.com" autoComplete="email" />
            <div className="sm:col-span-2">
              <Field id="address" label="Dirección de envío" required value={customer.address}
                onChange={(v) => setCustomer({ address: v })} onBlur={() => touch('address')}
                error={err('address')} placeholder="Calle principal, número y secundaria" autoComplete="street-address" />
            </div>
            <Field id="city" label="Ciudad" required value={customer.city}
              onChange={(v) => setCustomer({ city: v })} onBlur={() => touch('city')}
              error={err('city')} placeholder="Cuenca" autoComplete="address-level2" />
            <Field id="notes" label="Notas (opcional)" value={customer.notes}
              onChange={(v) => setCustomer({ notes: v })} placeholder="Color, fecha de entrega…" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="label">Datos de facturación</h2>
            <label className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
              <input
                type="checkbox"
                checked={customer.billingSame}
                onChange={(e) => setCustomer({ billingSame: e.target.checked })}
                className="h-4 w-4"
              />
              Mismos datos del envío
            </label>
          </div>
          <div className="mt-4 grid gap-x-3 gap-y-3 sm:grid-cols-2">
            <Field id="billingDocumentId" label="Cédula o RUC" required inputMode="numeric" value={customer.billingDocumentId}
              onChange={(v) => setCustomer({ billingDocumentId: v })} onBlur={() => touch('billingDocumentId')}
              error={err('billingDocumentId')} placeholder="0102030405" />
            {customer.billingSame ? (
              <p className="self-end pb-2 text-2xs text-ink-600">
                Se factura a {customer.firstName || 'tu nombre'} {customer.lastName} con los datos del envío.
              </p>
            ) : (
              <>
                <span className="hidden sm:block" />
                <Field id="billingFirstName" label="Nombres" required value={customer.billingFirstName}
                  onChange={(v) => setCustomer({ billingFirstName: v })} onBlur={() => touch('billingFirstName')}
                  error={err('billingFirstName')} autoComplete="off" />
                <Field id="billingLastName" label="Apellidos" required value={customer.billingLastName}
                  onChange={(v) => setCustomer({ billingLastName: v })} onBlur={() => touch('billingLastName')}
                  error={err('billingLastName')} autoComplete="off" />
                <Field id="billingPhone" label="Celular" required type="tel" inputMode="tel" value={customer.billingPhone}
                  onChange={(v) => setCustomer({ billingPhone: v })} onBlur={() => touch('billingPhone')}
                  error={err('billingPhone')} autoComplete="off" />
                <Field id="billingEmail" label="Correo electrónico" required type="email" inputMode="email" value={customer.billingEmail}
                  onChange={(v) => setCustomer({ billingEmail: v })} onBlur={() => touch('billingEmail')}
                  error={err('billingEmail')} autoComplete="off" />
                <div className="sm:col-span-2">
                  <Field id="billingAddress" label="Dirección" required value={customer.billingAddress}
                    onChange={(v) => setCustomer({ billingAddress: v })} onBlur={() => touch('billingAddress')}
                    error={err('billingAddress')} autoComplete="off" />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <aside className="lg:sticky lg:top-24 self-start">
        <div className="card p-6 space-y-5">
          <div>
            <div className="flex items-baseline justify-between">
              <span className="label">Resumen</span>
              <Link href="/carrito" className="text-2xs text-ink-600 hover:text-primary underline">Editar carrito</Link>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {items.map((it) => (
                <li key={cartItemKey(it)} className="flex justify-between gap-3">
                  <span className="text-ink-700 truncate">{it.quantity} × {it.name}</span>
                  <span className="font-mono tabular-nums">{formatMoney(it.unitPrice * it.quantity, it.currency)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 border-t border-ink-200/60 pt-4 text-sm">
            <Row label="Subtotal" value={formatMoney(subtotal)} />
            <Row label={TAX_LABEL} value={`+ ${formatMoney(taxAmount(subtotal))}`} />
            <Row
              label={isDelivery ? 'Envío a domicilio' : 'Retiro en oficina'}
              value={shippingFee > 0 ? `+ ${formatMoney(shippingFee)}` : 'Gratis'}
            />
            <div className="flex items-baseline justify-between pt-3 border-t border-ink-200/60">
              <span className="label">Total a pagar</span>
              <span className="font-mono text-2xl tabular-nums font-semibold">{formatMoney(total)}</span>
            </div>
            {!isDelivery && <p className="text-2xs text-ink-600">{PICKUP_ADDRESS}</p>}
          </div>

          {payphoneEnabled && (
            <div className="border-t border-ink-200/60 pt-4">
              <span className="label">Método de pago</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <MethodOption
                  active={paymentMethod === 'payphone'}
                  onClick={() => setPaymentMethod('payphone')}
                  title="Pagar ahora"
                  hint="Tarjeta vía PayPhone"
                />
                <MethodOption
                  active={paymentMethod === 'whatsapp'}
                  onClick={() => setPaymentMethod('whatsapp')}
                  title="Coordinar por WhatsApp"
                  hint="Transferencia o contra entrega"
                />
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
          ) : usePayphone ? (
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
            <button type="button" onClick={handleWhatsApp} className="btn-primary w-full">
              <WhatsAppIcon className="h-4 w-4" /> Finalizar por WhatsApp
            </button>
          )}
          <p className="text-2xs text-ink-600 text-center">
            {usePayphone
              ? 'Pago seguro procesado por PayPhone. Te contactaremos para coordinar la entrega.'
              : 'Se abrirá WhatsApp con tu pedido pre-formateado. Confirmamos disponibilidad y envío por chat.'}
          </p>
        </div>
      </aside>
    </div>
  );
}

function MethodOption({
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
    <div className="flex items-baseline justify-between">
      <span className="text-ink-600">{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`input mt-1.5 ${error ? 'border-danger focus:border-danger focus:ring-danger/15' : ''}`}
        placeholder={placeholder}
      />
      {error && <p id={`${id}-error`} className="mt-1 text-2xs text-danger">{error}</p>}
    </div>
  );
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.93.55 3.81 1.6 5.45L2 22l4.79-1.7a9.86 9.86 0 0 0 5.25 1.5h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.13-2.9-7C17.18 3.03 14.69 2 12.04 2Zm0 18.03h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-2.85 1.01.96-2.78-.2-.31a8.13 8.13 0 0 1-1.27-4.42c0-4.51 3.67-8.18 8.19-8.18 2.19 0 4.24.85 5.79 2.4a8.13 8.13 0 0 1 2.4 5.79c0 4.52-3.67 8.18-8.19 8.18Z" />
    </svg>
  );
}
