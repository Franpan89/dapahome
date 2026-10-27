const CONFIRM_URL = 'https://paymentbox.payphonetodoesposible.com/api/confirm';

export class PayphoneError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'PayphoneError';
  }
}

export interface PayphoneConfirmResult {
  statusCode: number;
  transactionStatus: 'Approved' | 'Canceled' | string;
  amount: number;
  authorizationCode?: string;
  transactionId: number;
  clientTransactionId: string;
  email?: string;
  phoneNumber?: string;
  cardType?: string;
  cardBrand?: string;
  message?: string;
  currency?: string;
  reference?: string;
  date?: string;
  [key: string]: unknown;
}

/** Confirma una transacción de la Cajita de Pagos. Debe llamarse dentro de los
 * primeros 5 minutos tras el pago: PayPhone reversa automáticamente si no se confirma. */
export async function confirmPayphoneTransaction(
  id: number,
  clientTxId: string,
): Promise<PayphoneConfirmResult> {
  const token = process.env.NEXT_PUBLIC_PAYPHONE_TOKEN;
  if (!token) throw new PayphoneError(500, 'payphoneTokenMissing');

  const res = await fetch(CONFIRM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id, clientTxId }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new PayphoneError(res.status, body?.message ?? `payphoneHttp${res.status}`);
  }
  return body as PayphoneConfirmResult;
}

/** PayPhone expresa todos los montos como enteros en centavos. */
export function toCents(amount: number) {
  return Math.round(amount * 100);
}
