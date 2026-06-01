import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { imageUrl, listBlogPosts } from '@/lib/supabase/queries';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog · Casos y guías de iluminación',
  description:
    'Proyectos reales, guías de compra y tendencias en iluminación y decoración de Dapa Home.',
  alternates: { canonical: '/blog' },
};

export default async function BlogIndexPage() {
  const posts = await listBlogPosts();

  return (
    <div className="container-page pt-12 pb-24">
      <header className="mb-10 max-w-2xl">
        <div className="label">Inspiración</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl tracking-tight">
          Casos, guías y miradas
        </h1>
        <p className="mt-3 text-ink-600 text-pretty">
          Proyectos reales con clientes Dapa Home, criterios para elegir bien y tendencias que vale la pena seguir.
        </p>
      </header>

      {posts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <PostCard key={p.id} post={p} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({
  post,
  priority,
}: {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    cover_image_path: string | null;
    project_location: string | null;
    published_at: string | null;
    created_at: string;
  };
  priority?: boolean;
}) {
  const date = post.published_at ?? post.created_at;
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-100">
        {post.cover_image_path && (
          <Image
            src={imageUrl(post.cover_image_path)}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
      </div>
      <div className="mt-4">
        <div className="flex items-center gap-2 text-2xs uppercase tracking-wider text-ink-600">
          <time dateTime={date}>
            {new Date(date).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
          </time>
          {post.project_location && (
            <>
              <span aria-hidden>·</span>
              <span>{post.project_location}</span>
            </>
          )}
        </div>
        <h2 className="mt-1.5 font-display text-xl leading-tight tracking-tight text-balance group-hover:text-primary transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-2 text-sm text-ink-600 line-clamp-3 text-pretty">{post.excerpt}</p>
        )}
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-surface p-16 text-center">
      <div className="text-4xl mb-3">📝</div>
      <p className="font-display text-xl">Pronto compartiremos historias</p>
      <p className="mt-2 text-sm text-ink-600">
        Estamos preparando los primeros casos. Vuelve en unos días.
      </p>
    </div>
  );
}
