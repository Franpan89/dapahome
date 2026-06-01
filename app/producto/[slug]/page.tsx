import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getProductBySlug, imageUrl, listRelatedProducts } from '@/lib/supabase/queries';
import { ProductDetail } from '@/components/ProductDetail';
import { ProductCard } from '@/components/ProductCard';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: 'Producto no encontrado' };
  return {
    title: p.name,
    description: p.description ?? undefined,
    alternates: { canonical: `/producto/${p.slug}` },
    openGraph: {
      title: p.name,
      description: p.description ?? undefined,
      url: `/producto/${p.slug}`,
      images: p.images[0] ? [imageUrl(p.images[0].storage_path)] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await listRelatedProducts(product.id, product.category_id, 4);

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dapahome.ec';
  const productUrl = `${base}/producto/${product.slug}`;
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${base}/catalogo` },
      ...(product.category
        ? [{
            '@type': 'ListItem',
            position: 3,
            name: product.category.name,
            item: `${base}/catalogo/${product.category.slug}`,
          }]
        : []),
      {
        '@type': 'ListItem',
        position: product.category ? 4 : 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.map((i) => imageUrl(i.storage_path)),
    sku: product.id,
    brand: { '@type': 'Brand', name: 'Dapa Home' },
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: product.currency,
      price: product.base_price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <div className="container-page pt-8 pb-32 lg:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <nav aria-label="Migas" className="text-2xs uppercase tracking-wider text-ink-600 mb-6">
        <Link href="/" className="hover:text-primary">Inicio</Link>
        <span className="mx-2">/</span>
        <Link href="/catalogo" className="hover:text-primary">Catálogo</Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/catalogo/${product.category.slug}`} className="hover:text-primary">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <ProductDetail product={product} />

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-20 pt-12 border-t border-ink-200/60">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="label">También te puede gustar</div>
              <h2 id="related-heading" className="mt-2 font-display text-3xl tracking-tight">
                Productos relacionados
              </h2>
            </div>
          </div>
          <div className="grid gap-x-4 gap-y-10 grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
