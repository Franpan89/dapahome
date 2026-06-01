import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  getBlogPostBySlug,
  imageUrl,
  listProductsByIds,
  listBlogPosts,
} from '@/lib/supabase/queries';
import { ProductCard } from '@/components/ProductCard';
import { renderMarkdown } from '@/lib/markdown';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: 'Entrada no encontrada' };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: 'article',
      url: `/blog/${post.slug}`,
      publishedTime: post.published_at ?? post.created_at,
      images: post.cover_image_path ? [imageUrl(post.cover_image_path)] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const [relatedProducts, recent] = await Promise.all([
    listProductsByIds(post.product_ids ?? []),
    listBlogPosts({ limit: 4 }),
  ]);
  const moreReading = recent.filter((p) => p.slug !== post.slug).slice(0, 3);

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dapahome.ec';
  const postUrl = `${base}/blog/${post.slug}`;
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image_path ? [imageUrl(post.cover_image_path)] : undefined,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: { '@type': 'Organization', name: 'Dapa Home' },
    publisher: {
      '@type': 'Organization',
      name: 'Dapa Home',
      logo: { '@type': 'ImageObject', url: `${base}/icon.png` },
    },
    mainEntityOfPage: postUrl,
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${base}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
    ],
  };

  const date = post.published_at ?? post.created_at;
  const html = renderMarkdown(post.body);

  return (
    <div className="container-page pt-8 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav aria-label="Migas" className="text-2xs uppercase tracking-wider text-ink-600 mb-6">
        <Link href="/" className="hover:text-primary">Inicio</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-primary">Blog</Link>
      </nav>

      <article className="mx-auto max-w-3xl">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-2xs uppercase tracking-wider text-ink-600">
            <time dateTime={date}>
              {new Date(date).toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' })}
            </time>
            {post.project_location && (
              <>
                <span aria-hidden>·</span>
                <span>{post.project_location}</span>
              </>
            )}
          </div>
          <h1 className="mt-3 font-display text-4xl md:text-5xl leading-[1.05] tracking-tight text-balance">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-lg text-ink-600 text-pretty">{post.excerpt}</p>
          )}
        </header>

        {post.cover_image_path && (
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-ink-100 mb-10">
            <Image
              src={imageUrl(post.cover_image_path)}
              alt={post.title}
              fill
              priority
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <div
          className="prose-blog max-w-none text-base md:text-lg"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-ink-200/60">
            <div className="label">Productos del proyecto</div>
            <h2 className="mt-2 font-display text-2xl tracking-tight">Lo que usamos</h2>
            <div className="mt-6 grid gap-x-4 gap-y-8 grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </article>

      {moreReading.length > 0 && (
        <section className="mt-20 pt-12 border-t border-ink-200/60">
          <h2 className="font-display text-2xl tracking-tight mb-6">Sigue leyendo</h2>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {moreReading.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-100">
                  {p.cover_image_path && (
                    <Image
                      src={imageUrl(p.cover_image_path)}
                      alt={p.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <h3 className="mt-3 font-display text-lg leading-tight tracking-tight group-hover:text-primary transition-colors">
                  {p.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
