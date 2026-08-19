import { NextResponse } from 'next/server';
import { getCheapestShippingQuote } from '@/lib/sendifico/quote';
import { SendificoError } from '@/lib/sendifico/client';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const territoryBaseId = body?.territoryBaseId;

  if (typeof territoryBaseId !== 'string' || !territoryBaseId) {
    return NextResponse.json({ error: 'territoryBaseId es requerido' }, { status: 400 });
  }

  try {
    const quote = await getCheapestShippingQuote(territoryBaseId);
    if (!quote) {
      return NextResponse.json({ error: 'Sin cobertura de transportistas para esta ciudad' }, { status: 404 });
    }
    return NextResponse.json(quote);
  } catch (err) {
    const message = err instanceof SendificoError ? err.message : 'sendificoQuoteFailed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
