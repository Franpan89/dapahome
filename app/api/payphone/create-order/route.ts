import { NextResponse } from 'next/server';
import { createPayphoneOrder, OrderError } from '@/lib/payphone/orders';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });

  try {
    const amounts = await createPayphoneOrder({
      items: body.items,
      customer: body.customer,
    });
    return NextResponse.json(amounts);
  } catch (err) {
    const message = err instanceof OrderError ? err.message : 'No se pudo crear el pedido.';
    const status = err instanceof OrderError ? err.statusCode : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
