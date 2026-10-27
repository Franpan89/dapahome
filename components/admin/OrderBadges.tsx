import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_STYLE,
  PAYMENT_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  isOrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from '@/lib/orders/status';

export function StatusBadge({ status }: { status: string }) {
  if (!isOrderStatus(status)) return <span className="text-xs text-ink-600">{status}</span>;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_STYLE[status]}`}>
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

export function PaymentBadge({ method, status }: { method: PaymentMethod; status: PaymentStatus }) {
  const tone =
    status === 'paid' ? 'text-emerald-700' : status === 'failed' ? 'text-rose-700' : 'text-ink-600';
  return (
    <div className="text-xs leading-tight">
      <div className="text-ink-700">{PAYMENT_METHOD_LABEL[method]}</div>
      <div className={tone}>{PAYMENT_STATUS_LABEL[status]}</div>
    </div>
  );
}
