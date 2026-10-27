import { randomUUID } from 'crypto';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { taxAmount, withTax, DELIVERY_FEE } from '@/lib/format';
import { confirmPayphoneTransaction, toCents, PayphoneError } from '@/lib/payphone/client';
import type { CartItem } from '@/lib/cart/store';
import type { CustomerData } from '@/lib/cart/customer';
import { validateCustomer, billingForPayphone } from '@/lib/checkout/validate';
import type { PaymentMethod } from '@/lib/orders/status';

export class OrderError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'OrderError';
  }
}

export interface CreateOrderInput {
  items: CartItem[];
  customer: CustomerData;
}

export interface PayphoneBoxAmounts {
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

/** Valida el carrito y los datos, y recalcula los montos en el servidor. */
function prepareOrder({ items, customer }: CreateOrderInput) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderError(400, 'El carrito está vacío.');
  }
  if (!customer || Object.keys(validateCustomer(customer)).length > 0) {
    throw new OrderError(400, 'Faltan datos de envío o facturación.');
  }
  const shippingFee = customer.delivery === 'delivery' ? DELIVERY_FEE : 0;
  const subtotal = items.reduce((acc, it) => acc + Number(it.unitPrice) * Number(it.quantity), 0);
  if (!(subtotal > 0)) {
    throw new OrderError(400, 'El total del pedido no es válido.');
  }
  const tax = taxAmount(subtotal);
  const total = withTax(subtotal) + shippingFee;
  const currency = items[0]?.currency || 'USD';
  return { items, customer, shippingFee, subtotal, tax, total, currency };
}

async function insertOrder(
  prepared: ReturnType<typeof prepareOrder>,
  paymentMethod: PaymentMethod,
) {
  const clientTransactionId = randomUUID();
  const sb = createSupabaseAdmin();
  const { data, error } = await sb
    .from('orders')
    .insert({
      status: 'recibido',
      payment_status: 'pending',
      payment_method: paymentMethod,
      client_transaction_id: clientTransactionId,
      customer: prepared.customer,
      items: prepared.items,
      delivery_method: prepared.customer.delivery,
      subtotal: prepared.subtotal,
      tax: prepared.tax,
      shipping_fee: prepared.shippingFee,
      total: prepared.total,
      currency: prepared.currency,
    })
    .select('order_number')
    .single();
  if (error) {
    console.error('[orders] insert failed', error);
    throw new OrderError(500, 'No se pudo registrar el pedido.');
  }
  return { clientTransactionId, orderNumber: data.order_number as number };
}

export async function createPayphoneOrder(input: CreateOrderInput): Promise<PayphoneBoxAmounts> {
  const prepared = prepareOrder(input);
  const { clientTransactionId } = await insertOrder(prepared, 'payphone');
  const { customer, shippingFee, subtotal, tax, total, currency } = prepared;

  return {
    clientTransactionId,
    amount: toCents(total),
    amountWithoutTax: toCents(shippingFee),
    amountWithTax: toCents(subtotal),
    tax: toCents(tax),
    reference: `Dapa Home - ${customer.firstName} ${customer.lastName}`.slice(0, 100),
    currency,
    ...billingForPayphone(customer),
  };
}

export async function createWhatsAppOrder(input: CreateOrderInput) {
  const prepared = prepareOrder(input);
  const { orderNumber } = await insertOrder(prepared, 'whatsapp');
  return { orderNumber };
}

export interface ConfirmPayphoneOrderInput {
  id: number;
  clientTransactionId: string;
}

export interface ConfirmedOrderSummary {
  status: 'paid' | 'failed';
  total: number;
  currency: string;
  authorizationCode: string | null;
  reference: string | null;
}

export async function confirmPayphoneOrder({
  id,
  clientTransactionId,
}: ConfirmPayphoneOrderInput): Promise<ConfirmedOrderSummary> {
  const sb = createSupabaseAdmin();
  const { data: order, error } = await sb
    .from('orders')
    .select('*')
    .eq('client_transaction_id', clientTransactionId)
    .maybeSingle();

  if (error || !order) throw new OrderError(404, 'Pedido no encontrado.');

  if (order.payment_status === 'paid' || order.payment_status === 'failed') {
    return {
      status: order.payment_status,
      total: order.total,
      currency: order.currency,
      authorizationCode: order.authorization_code,
      reference: order.payphone_response?.reference ?? null,
    };
  }

  let result;
  try {
    result = await confirmPayphoneTransaction(id, clientTransactionId);
  } catch (err) {
    const message = err instanceof PayphoneError ? err.message : 'payphoneConfirmFailed';
    await sb
      .from('orders')
      .update({ payment_status: 'failed', error_message: message, updated_at: new Date().toISOString() })
      .eq('id', order.id);
    throw new OrderError(502, message);
  }

  const amountMatches =
    result.clientTransactionId === order.client_transaction_id && result.amount === toCents(order.total);
  const approved = amountMatches && result.transactionStatus === 'Approved';

  await sb
    .from('orders')
    .update({
      payment_status: approved ? 'paid' : 'failed',
      // Un pedido recién recibido pasa a Pagado; si el admin ya lo movió, se respeta.
      status: approved && order.status === 'recibido' ? 'pagado' : order.status,
      payphone_transaction_id: result.transactionId ?? null,
      authorization_code: result.authorizationCode ?? null,
      payphone_response: result,
      error_message: amountMatches ? null : 'El monto confirmado por PayPhone no coincide con el pedido.',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  return {
    status: approved ? 'paid' : 'failed',
    total: order.total,
    currency: order.currency,
    authorizationCode: result.authorizationCode ?? null,
    reference: result.reference ?? null,
  };
}
