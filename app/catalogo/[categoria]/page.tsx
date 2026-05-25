import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { CategoryPills } from '@/components/CategoryPills';
import { CatalogSearch } from '@/components/CatalogSearch';
import { getCategories, listProducts } from '@/lib/supabase/queries';

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const [categories, products] = await Promise.all([
    getCategories(),
    listProducts({ category: categoria }),
  ]);
  const cat = categories.find((c) => c.slug === categoria);
  if (!cat) notFound();

  return (
    <div className="container-page pt-8 pb-24">
      <header className="mb-6">
        <div className="label">Categoría</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl tracking-tight">{cat.name}</h1>
        {cat.description && (
          <p className="mt-3 max-w-2xl text-ink-600 text-pretty">{cat.description}</p>
        )}
      </header>

      <div className="space-y-4">
        <CatalogSearch />
        <CategoryPills categories={categories} />
      </div>

      <div className="mt-8">
        <div className="mb-5 text-sm text-ink-600">
          {products.length} {products.length === 1 ? 'producto' : 'productos'}
        </div>
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-surface p-12 text-center text-ink-600">
            <div className="text-4xl mb-3">📦</div>
            Aún no hay productos en esta categoría.
          </div>
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
