import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/guard';
import { AdminShell } from '@/components/AdminShell';
import { StatusBadge, PaymentBadge } from '@/components/admin/OrderBadges';
import { updateOrderAction } from '../actions';
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from '@/lib/orders/status';
import { formatMoney, PICKUP_ADDRESS } from '@/lib/format';
import { effectiveBilling, type CustomerData } from '@/lib/cart/customer';
import type { CartItem } from '@/lib/cart/store';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const { user, supabase } = await requireAdmin();

  const { data: order } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
  if (!order) notFound();

  const customer = order.customer as CustomerData;
  const items = (order.items ?? []) as CartItem[];
  const billing = effectiveBilling(customer);
  const isDelivery = order.delivery_method === 'delivery';
  const waLink = `https://wa.me/${String(customer.phone ?? '').replace(/\D/g, '').replace(/^0/, '593')}`;

  return (
    <AdminShell email={user.email}>
      <Link href="/admin/pedidos" className="text-xs text-ink-600 hover:text-primary">← Pedidos</Link>
      <div className="mt-2 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl tracking-tight">Pedido #{order.order_number}</h1>
        <StatusBadge status={order.status} />
        <span className="text-sm text-ink-600">
          {new Date(order.created_at).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
      </div>

      {saved && (
        <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          Cambios guardados.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] items-start">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="label">Productos</h2>
            <ul className="mt-3 divide-y divide-ink-200/60">
              {items.map((it, i) => (
                <li key={i} className="flex justify-between gap-4 py-3 text-sm">
                  <div>
                    <div className="font-medium">{it.quantity} × {it.name}</div>
                    {(it.variantLabel || it.colorLabel) && (
                      <div className="text-xs text-ink-600">{[it.variantLabel, it.colorLabel].filter(Boolean).join(' · ')}</div>
                    )}
                  </div>
                  <div className="font-mono tabular-nums">{formatMoney(it.unitPrice * it.quantity, it.currency)}</div>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-ink-200/60 pt-3 text-sm">
              <Line label="Subtotal" value={formatMoney(Number(order.subtotal), order.currency)} />
              <Line label="IVA" value={formatMoney(Number(order.tax), order.currency)} />
              <Line label={isDelivery ? 'Envío' : 'Retiro en oficina'} value={formatMoney(Number(order.shipping_fee), order.currency)} />
              <div className="flex justify-between border-t border-ink-200/60 pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd className="font-mono tabular-nums">{formatMoney(Number(order.total), order.currency)}</dd>
              </div>
            </dl>
          </section>

          <div className="grid gap-6 sm:grid-cols-2">
            <section className="card p-6 text-sm">
              <h2 className="label">Envío</h2>
              <div className="mt-3 space-y-1">
                <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                <div>{customer.phone} · <a href={waLink} target="_blank" rel="noreferrer" className="text-primary underline">WhatsApp</a></div>
                <div>{customer.email}</div>
                <div className="pt-2">{isDelivery ? `${customer.address}, ${customer.city}` : PICKUP_ADDRESS}</div>
                <div className="text-xs text-ink-600">{isDelivery ? 'Envío a domicilio' : 'Retiro en oficina'} · {customer.city}</div>
                {customer.notes && <div className="pt-2 text-ink-700">Notas: {customer.notes}</div>}
              </div>
            </section>
            <section className="card p-6 text-sm">
              <h2 className="label">Facturación</h2>
              <div className="mt-3 space-y-1">
                <div className="font-medium">{billing.firstName} {billing.lastName}</div>
                <div>Cédula/RUC: <span className="font-mono">{billing.documentId}</span></div>
                <div>{billing.phone}</div>
                <div>{billing.email}</div>
                <div>{billing.address}</div>
              </div>
            </section>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6">
          <form action={updateOrderAction} className="card p-6 space-y-4">
            <input type="hidden" name="id" value={order.id} />
            <h2 className="label">Estado del pedido</h2>
            <select name="status" defaultValue={order.status} className="input">
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
              ))}
            </select>
            <div>
              <label htmlFor="admin_notes" className="label">Notas internas</label>
              <textarea
                id="admin_notes"
                name="admin_notes"
                defaultValue={order.admin_notes ?? ''}
                className="input mt-1.5 min-h-[100px]"
                placeholder="Ej.: transferencia verificada, fecha de entrega…"
              />
            </div>
            <button className="btn-primary w-full">Guardar</button>
          </form>

          <section className="card p-6 text-sm space-y-2">
            <h2 className="label">Pago</h2>
            <PaymentBadge method={order.payment_method} status={order.payment_status} />
            {order.authorization_code && (
              <div className="text-xs text-ink-600">Autorización: <span className="font-mono">{order.authorization_code}</span></div>
            )}
            {order.payphone_transaction_id && (
              <div className="text-xs text-ink-600">ID PayPhone: <span className="font-mono">{order.payphone_transaction_id}</span></div>
            )}
            {order.error_message && <div className="text-xs text-danger">{order.error_message}</div>}
            {order.payment_method === 'whatsapp' && (
              <p className="text-xs text-ink-600">El pago de este pedido se valida manualmente por WhatsApp.</p>
            )}
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-600">{label}</dt>
      <dd className="font-mono tabular-nums">{value}</dd>
    </div>
  );
}
