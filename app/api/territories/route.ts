import { NextResponse } from 'next/server';
import { listTerritories } from '@/lib/sendifico/quote';

export async function GET() {
  try {
    const territories = await listTerritories();
    const simplified = territories.map((t) => ({
      territoryBaseId: t.territoryBaseId,
      label: t.searchableText,
    }));
    return NextResponse.json(simplified, {
      headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
    });
  } catch {
    return NextResponse.json({ error: 'No se pudo cargar el listado de ciudades' }, { status: 502 });
  }
}
