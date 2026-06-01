import { ProductCard } from '@/components/ProductCard';
import { CategoryPills } from '@/components/CategoryPills';
import { CatalogSearch } from '@/components/CatalogSearch';
import { CatalogToolbar, CatalogPagination } from '@/components/CatalogToolbar';
import { getCategories, searchCatalog } from '@/lib/supabase/queries';
import type { CatalogSort } from '@/lib/supabase/queries';

export const revalidate = 60;

export const metadata = {
  title: 'Catálogo',
  description: 'Catálogo completo de iluminación, decoración y domótica Dapa Home.',
  alternates: { canonical: '/catalogo' },
};

const VALID_SORTS: CatalogSort[] = ['recientes', 'destacados', 'precio-asc', 'precio-desc'];

interface Props {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    min?: string;
    max?: string;
    page?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;
  const sort = VALID_SORTS.includes(params.sort as CatalogSort)
    ? (params.sort as CatalogSort)
    : 'recientes';
  const priceMin = params.min ? Number(params.min) : undefined;
  const priceMax = params.max ? Number(params.max) : undefined;
  const page = params.page ? Number(params.page) : 1;

  const [categories, { items, total, perPage }] = await Promise.all([
    getCategories(),
    searchCatalog({
      q: params.q,
      sort,
      priceMin: Number.isFinite(priceMin) ? priceMin : undefined,
      priceMax: Number.isFinite(priceMax) ? priceMax : undefined,
      page: Number.isFinite(page) ? page : 1,
    }),
  ]);

  return (
    <div className="container-page pt-8 pb-24">
      <header className="mb-6">
        <div className="label">Catálogo</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl tracking-tight">
          Todo lo que tenemos
        </h1>
      </header>

      <div className="space-y-4">
        <CatalogSearch defaultValue={params.q ?? ''} />
        <CategoryPills categories={categories} />
      </div>

      <div className="mt-8">
        <div className="mb-5">
          <CatalogToolbar
            total={total}
            q={params.q}
            sort={sort}
            priceMin={Number.isFinite(priceMin) ? priceMin : undefined}
            priceMax={Number.isFinite(priceMax) ? priceMax : undefined}
          />
        </div>

        {items.length === 0 ? (
          <EmptyState query={params.q} />
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

function EmptyState({ query }: { query?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-surface p-12 text-center">
      <div className="text-4xl mb-3">🔍</div>
      <p className="font-display text-xl">No encontramos productos</p>
      <p className="mt-2 text-sm text-ink-600">
        {query ? `Nada con "${query}". Prueba otra palabra, ajusta el precio o explora por categoría.` : 'Aún no hay productos con estos filtros.'}
      </p>
    </div>
  );
}
