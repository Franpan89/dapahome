import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { isSupabaseConfigured, DEMO_PRODUCTS } from '@/lib/supabase/demo';
import { imageUrl } from '@/lib/supabase/image';

export interface SearchHit {
  slug: string;
  name: string;
  category: string | null;
  imageUrl: string | null;
  price: number;
  currency: string;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ results: [] });

  if (!isSupabaseConfigured()) {
    const lower = q.toLowerCase();
    const results: SearchHit[] = DEMO_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        (p.description ?? '').toLowerCase().includes(lower),
    )
      .slice(0, 6)
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        category: p.category?.name ?? null,
        imageUrl: p.images[0] ? imageUrl(p.images[0].storage_path) : null,
        price: p.base_price,
        currency: p.currency,
      }));
    return NextResponse.json({ results });
  }

  try {
    const sb = await createSupabaseServer();
    const { data } = await sb
      .from('products')
      .select(
        'slug, name, base_price, currency, category:categories(name), images:product_images(storage_path, is_primary, sort_order)',
      )
      .eq('status', 'active')
      .ilike('search_text', `%${q.toLowerCase()}%`)
      .limit(6);

    const results: SearchHit[] = (data ?? []).map((p) => {
      const imgs = [...((p.images as { storage_path: string; is_primary: boolean; sort_order: number }[]) ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
      return {
        slug: p.slug as string,
        name: p.name as string,
        category: (p.category as unknown as { name: string } | null)?.name ?? null,
        imageUrl: primary ? imageUrl(primary.storage_path) : null,
        price: p.base_price as number,
        currency: p.currency as string,
      };
    });

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
