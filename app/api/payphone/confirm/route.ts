import { NextResponse } from 'next/server';
import { confirmPayphoneOrder, OrderError } from '@/lib/payphone/orders';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const id = Number(body?.id);
  const clientTransactionId = body?.clientTransactionId;

  if (!Number.isFinite(id) || typeof clientTransactionId !== 'string' || !clientTransactionId) {
    return NextResponse.json({ error: 'id y clientTransactionId son requeridos' }, { status: 400 });
  }

  try {
    const summary = await confirmPayphoneOrder({ id, clientTransactionId });
    return NextResponse.json(summary);
  } catch (err) {
    const message = err instanceof OrderError ? err.message : 'No se pudo confirmar el pago.';
    const status = err instanceof OrderError ? err.statusCode : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
