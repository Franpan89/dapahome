import { randomUUID } from 'crypto';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { taxAmount, withTax, DELIVERY_FEE } from '@/lib/format';
import { confirmPayphoneTransaction, toCents, PayphoneError } from '@/lib/payphone/client';
import type { CartItem, CustomerData } from '@/lib/cart/store';

export class OrderError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'OrderError';
  }
}

export interface CreatePayphoneOrderInput {
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
}

export async function createPayphoneOrder({
  items,
  customer,
}: CreatePayphoneOrderInput): Promise<PayphoneBoxAmounts> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderError(400, 'El carrito está vacío.');
  }
  if (!customer?.name || customer.name.trim().length < 2) {
    throw new OrderError(400, 'Falta el nombre del cliente.');
  }
  if (!customer?.city || customer.city.trim().length < 2) {
    throw new OrderError(400, 'Falta la ciudad del cliente.');
  }

  const safeShippingFee = customer.delivery === 'delivery' ? DELIVERY_FEE : 0;
  const subtotal = items.reduce((acc, it) => acc + Number(it.unitPrice) * Number(it.quantity), 0);
  if (subtotal <= 0) {
    throw new OrderError(400, 'El total del pedido no es válido.');
  }
  const tax = taxAmount(subtotal);
  const total = withTax(subtotal) + safeShippingFee;
  const currency = items[0]?.currency || 'USD';
  const clientTransactionId = randomUUID();
  const reference = `Dapa Home - ${customer.name}`.slice(0, 100);

  const sb = createSupabaseAdmin();
  const { error } = await sb.from('orders').insert({
    status: 'pending',
    payment_method: 'payphone',
    client_transaction_id: clientTransactionId,
    customer,
    items,
    delivery_method: customer.delivery,
    subtotal,
    tax,
    shipping_fee: safeShippingFee,
    total,
    currency,
  });
  if (error) throw new OrderError(500, 'No se pudo registrar el pedido.');

  return {
    clientTransactionId,
    amount: toCents(total),
    amountWithoutTax: toCents(safeShippingFee),
    amountWithTax: toCents(subtotal),
    tax: toCents(tax),
    reference,
    currency,
  };
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

  if (order.status === 'paid' || order.status === 'failed') {
    return {
      status: order.status,
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
      .update({ status: 'failed', error_message: message, updated_at: new Date().toISOString() })
      .eq('id', order.id);
    throw new OrderError(502, message);
  }

  const expectedCents = toCents(order.total);
  const amountMatches =
    result.clientTransactionId === order.client_transaction_id && result.amount === expectedCents;
  const approved = amountMatches && result.transactionStatus === 'Approved';

  await sb
    .from('orders')
    .update({
      status: approved ? 'paid' : 'failed',
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
