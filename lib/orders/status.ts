export const ORDER_STATUSES = [
  'recibido',
  'pagado',
  'en_fabricacion',
  'completado',
  'enviado',
  'entregado',
  'cancelado',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  recibido: 'Recibido',
  pagado: 'Pagado',
  en_fabricacion: 'En fabricación',
  completado: 'Completado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  recibido: 'bg-sky-100 text-sky-800',
  pagado: 'bg-emerald-100 text-emerald-800',
  en_fabricacion: 'bg-amber-100 text-amber-800',
  completado: 'bg-violet-100 text-violet-800',
  enviado: 'bg-indigo-100 text-indigo-800',
  entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-rose-100 text-rose-800',
};

export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type PaymentMethod = 'payphone' | 'whatsapp';

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'Pago pendiente',
  paid: 'Pago aprobado',
  failed: 'Pago fallido',
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  payphone: 'PayPhone (tarjeta)',
  whatsapp: 'WhatsApp',
};

export function isOrderStatus(v: unknown): v is OrderStatus {
  return typeof v === 'string' && (ORDER_STATUSES as readonly string[]).includes(v);
}
