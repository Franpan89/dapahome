import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ProductCard } from '@/components/ProductCard';
import { CategoryPills } from '@/components/CategoryPills';
import { CatalogSearch } from '@/components/CatalogSearch';
import { CatalogToolbar, CatalogPagination } from '@/components/CatalogToolbar';
import { getCategories, searchCatalog } from '@/lib/supabase/queries';
import type { CatalogSort } from '@/lib/supabase/queries';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dapahome.ec';

export const revalidate = 60;

const VALID_SORTS: CatalogSort[] = ['recientes', 'destacados', 'precio-asc', 'precio-desc'];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === categoria);
  if (!cat) return { title: 'Categoría no encontrada' };
  return {
    title: cat.name,
    description: cat.description ?? undefined,
    alternates: { canonical: `/catalogo/${cat.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<{ q?: string; sort?: string; min?: string; max?: string; page?: string }>;
}) {
  const { categoria } = await params;
  const sp = await searchParams;
  const sort = VALID_SORTS.includes(sp.sort as CatalogSort) ? (sp.sort as CatalogSort) : 'recientes';
  const priceMin = sp.min ? Number(sp.min) : undefined;
  const priceMax = sp.max ? Number(sp.max) : undefined;
  const page = sp.page ? Number(sp.page) : 1;

  const [categories, { items, total, perPage }] = await Promise.all([
    getCategories(),
    searchCatalog({
      category: categoria,
      q: sp.q,
      sort,
      priceMin: Number.isFinite(priceMin) ? priceMin : undefined,
      priceMax: Number.isFinite(priceMax) ? priceMax : undefined,
      page: Number.isFinite(page) ? page : 1,
    }),
  ]);
  const cat = categories.find((c) => c.slug === categoria);
  if (!cat) notFound();

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${SITE_URL}/catalogo` },
      { '@type': 'ListItem', position: 3, name: cat.name, item: `${SITE_URL}/catalogo/${cat.slug}` },
    ],
  };

  return (
    <div className="container-page pt-8 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <nav aria-label="Migas" className="text-2xs uppercase tracking-wider text-ink-600 mb-6">
        <Link href="/" className="hover:text-primary">Inicio</Link>
        <span className="mx-2">/</span>
        <Link href="/catalogo" className="hover:text-primary">Catálogo</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-900">{cat.name}</span>
      </nav>
      <header className="mb-6">
        <div className="label">Categoría</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl tracking-tight">{cat.name}</h1>
        {cat.description && (
          <p className="mt-3 max-w-2xl text-ink-600 text-pretty">{cat.description}</p>
        )}
      </header>

      <div className="space-y-4">
        <CatalogSearch defaultValue={sp.q ?? ''} />
        <CategoryPills categories={categories} />
      </div>

      <div className="mt-8">
        <div className="mb-5">
          <CatalogToolbar
            total={total}
            q={sp.q}
            sort={sort}
            priceMin={Number.isFinite(priceMin) ? priceMin : undefined}
            priceMax={Number.isFinite(priceMax) ? priceMax : undefined}
          />
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-surface p-12 text-center text-ink-600">
            <div className="text-4xl mb-3">📦</div>
            Sin productos con estos filtros en esta categoría.
          </div>
        ) : (
          <>
            <div className="grid gap-x-4 gap-y-10 grid-cols-2 lg:grid-cols-4">
              {items.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
            <CatalogPagination page={page} total={total} perPage={perPage} />
          </>
        )}
      </div>
    </div>
  );
}
