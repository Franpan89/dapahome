import { ProductCard } from '@/components/ProductCard';
import { CategoryPills } from '@/components/CategoryPills';
import { CatalogSearch } from '@/components/CatalogSearch';
import { getCategories, listProducts } from '@/lib/supabase/queries';

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ q?: string; cat?: string }>;
}

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    listProducts({ q: params.q }),
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
        <div className="mb-5 flex items-center justify-between text-sm text-ink-600">
          <span>
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
            {params.q && <> para "<span className="text-ink-900">{params.q}</span>"</>}
          </span>
        </div>

        {products.length === 0 ? (
          <EmptyState query={params.q} />
        ) : (
          <div className="grid gap-x-4 gap-y-10 grid-cols-2 lg:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
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
        {query ? `Nada con "${query}". Prueba otra palabra o explora por categoría.` : 'Aún no hay productos en esta vista.'}
      </p>
    </div>
  );
}
