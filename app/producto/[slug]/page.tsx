import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getProductBySlug, imageUrl } from '@/lib/supabase/queries';
import { ProductDetail } from '@/components/ProductDetail';

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
    openGraph: {
      title: p.name,
      description: p.description ?? undefined,
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

  return (
    <div className="container-page pt-8 pb-24">
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
    </div>
  );
}
