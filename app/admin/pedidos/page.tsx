import Link from 'next/link';
import { requireAdmin } from '@/lib/supabase/guard';
import { AdminShell } from '@/components/AdminShell';
import { StatusBadge, PaymentBadge } from '@/components/admin/OrderBadges';
import { ORDER_STATUSES, ORDER_STATUS_LABEL, isOrderStatus, type PaymentMethod, type PaymentStatus } from '@/lib/orders/status';
import { formatMoney } from '@/lib/format';

export const dynamic = 'force-dynamic';

interface OrderRow {
  id: string;
  order_number: number;
  created_at: string;
  status: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  total: number;
  currency: string;
  customer: { firstName?: string; lastName?: string; phone?: string; email?: string; city?: string };
}

export default async function OrdersAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string; intentos?: string }>;
}) {
  const { estado, q, intentos } = await searchParams;
  const { user, supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, created_at, status, payment_method, payment_status, total, currency, customer')
    .order('created_at', { ascending: false })
    .limit(500);

  const all = (data ?? []) as OrderRow[];
  const showAttempts = intentos === '1';
  // Un intento de pago con tarjeta que nunca se aprobó no es un pedido real.
  const isAttempt = (o: OrderRow) => o.payment_method === 'payphone' && o.payment_status !== 'paid';
  const attempts = all.filter(isAttempt).length;
  const base = showAttempts ? all : all.filter((o) => !isAttempt(o));

  const counts = new Map<string, number>();
  for (const o of base) counts.set(o.status, (counts.get(o.status) ?? 0) + 1);

  const term = (q ?? '').trim().toLowerCase();
  const rows = base.filter((o) => {
    if (estado && isOrderStatus(estado) && o.status !== estado) return false;
    if (!term) return true;
    const c = o.customer ?? {};
    const hay = [String(o.order_number), c.firstName, c.lastName, c.phone, c.email, c.city]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(term);
  });

  const href = (params: { estado?: string; intentos?: string }) => {
    const sp = new URLSearchParams();
    const e = 'estado' in params ? params.estado : estado;
    const i = 'intentos' in params ? params.intentos : intentos;
    if (e) sp.set('estado', e);
    if (q) sp.set('q', q);
    if (i) sp.set('intentos', i);
    const s = sp.toString();
    return `/admin/pedidos${s ? `?${s}` : ''}`;
  };

  return (
    <AdminShell email={user.email}>
      <div className="mb-6">
        <div className="label">Ventas</div>
        <h1 className="font-display text-3xl tracking-tight">Pedidos</h1>
        <p className="mt-1 text-sm text-ink-600">
          {rows.length} pedido(s). Incluye los pagados con tarjeta y los enviados por WhatsApp.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          No se pudieron cargar los pedidos. ¿Ya corriste la migración 0010_order_workflow.sql?
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <Chip href={href({ estado: undefined })} active={!estado} label="Todos" count={base.length} />
        {ORDER_STATUSES.map((s) => (
          <Chip key={s} href={href({ estado: s })} active={estado === s} label={ORDER_STATUS_LABEL[s]} count={counts.get(s) ?? 0} />
        ))}
      </div>

      <form className="mb-4 flex flex-wrap items-center gap-3" action="/admin/pedidos">
        {estado && <input type="hidden" name="estado" value={estado} />}
        {intentos && <input type="hidden" name="intentos" value={intentos} />}
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar por número, nombre, celular, correo o ciudad…"
          className="input w-full max-w-md"
        />
        <button className="btn">Buscar</button>
        {attempts > 0 && (
          <Link href={href({ intentos: showAttempts ? undefined : '1' })} className="text-xs text-ink-600 underline">
            {showAttempts ? 'Ocultar' : 'Mostrar'} {attempts} intento(s) de pago sin completar
          </Link>
        )}
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-100 text-2xs uppercase tracking-wider text-ink-600">
            <tr>
              <th className="text-left px-4 py-3">N.º</th>
              <th className="text-left px-4 py-3">Fecha</th>
              <th className="text-left px-4 py-3">Cliente</th>
              <th className="text-left px-4 py-3">Pago</th>
              <th className="text-right px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/60">
            {rows.map((o) => (
              <tr key={o.id} className="hover:bg-ink-100/50">
                <td className="px-4 py-3 font-mono">
                  <Link href={`/admin/pedidos/${o.id}`} className="text-primary hover:underline">
                    #{o.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-600 whitespace-nowrap">
                  {new Date(o.created_at).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{o.customer?.firstName} {o.customer?.lastName}</div>
                  <div className="text-xs text-ink-600">{[o.customer?.phone, o.customer?.city].filter(Boolean).join(' · ')}</div>
                </td>
                <td className="px-4 py-3"><PaymentBadge method={o.payment_method} status={o.payment_status} /></td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{formatMoney(Number(o.total), o.currency)}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-ink-600">No hay pedidos con estos filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

function Chip({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-xs transition ${
        active ? 'border-ink-900 bg-ink-900 text-white' : 'border-ink-200 hover:border-ink-400'
      }`}
    >
      {label} <span className={active ? 'text-white/70' : 'text-ink-600'}>{count}</span>
    </Link>
  );
}
