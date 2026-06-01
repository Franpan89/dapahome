import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/guard';
import { AdminShell } from '@/components/AdminShell';
import { saveBlogPostAction, deleteBlogPostAction } from '@/app/admin/actions';
import { AdminBlogCover } from '@/components/admin/AdminBlogCover';
import type { BlogPost } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, supabase } = await requireAdmin();
  const { data } = await supabase.from('blog_posts').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  const post = data as BlogPost;

  // Catálogo de productos publicados para elegir relacionados
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug')
    .eq('status', 'active')
    .order('name');

  const selectedIds = new Set(post.product_ids ?? []);

  return (
    <AdminShell email={user.email}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="label">Editar entrada</div>
          <h1 className="font-display text-2xl tracking-tight">{post.title}</h1>
          <div className="mt-1 text-2xs text-ink-600 font-mono">/blog/{post.slug}</div>
        </div>
        <div className="flex gap-2">
          {post.status === 'active' && (
            <Link href={`/blog/${post.slug}`} target="_blank" className="btn-outline">Ver público ↗</Link>
          )}
          <Link href="/admin/blog" className="text-sm text-ink-600 hover:text-primary self-center">← Volver</Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <form action={saveBlogPostAction} className="card p-6 space-y-4">
          <input type="hidden" name="id" value={post.id} />

          <div>
            <label htmlFor="title" className="label">Título</label>
            <input id="title" name="title" defaultValue={post.title} required className="input mt-1.5" />
          </div>
          <div>
            <label htmlFor="slug" className="label">Slug</label>
            <input id="slug" name="slug" defaultValue={post.slug} className="input mt-1.5 font-mono text-xs" />
          </div>
          <div>
            <label htmlFor="excerpt" className="label">Extracto</label>
            <textarea id="excerpt" name="excerpt" defaultValue={post.excerpt ?? ''} className="input mt-1.5 min-h-[80px]" />
          </div>
          <div>
            <label htmlFor="project_location" className="label">Ubicación del proyecto</label>
            <input id="project_location" name="project_location" defaultValue={post.project_location ?? ''} className="input mt-1.5" placeholder="Ej: Cumbayá" />
          </div>
          <div>
            <label htmlFor="body" className="label">Cuerpo (Markdown)</label>
            <textarea
              id="body"
              name="body"
              defaultValue={post.body ?? ''}
              className="input mt-1.5 min-h-[400px] font-mono text-xs leading-relaxed"
              placeholder={`## Subtítulo\n\nUn párrafo con **negrita** y un [link](https://...).\n\n- Punto 1\n- Punto 2\n\n![alt](https://url-de-imagen.jpg)`}
            />
            <p className="mt-1 text-2xs text-ink-600">
              Markdown básico: <code>##</code> y <code>###</code> para títulos, <code>**bold**</code>, <code>*italic*</code>, <code>[texto](url)</code>, <code>![alt](url)</code>, listas con <code>-</code> o <code>1.</code>, separador <code>---</code>.
            </p>
          </div>
          <div>
            <label htmlFor="status" className="label">Estado</label>
            <select id="status" name="status" defaultValue={post.status} className="input mt-1.5">
              <option value="draft">Borrador</option>
              <option value="active">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
            <p className="mt-1 text-2xs text-ink-600">
              {post.published_at
                ? `Publicado el ${new Date(post.published_at).toLocaleDateString('es-EC')}.`
                : 'Aún sin publicar.'}
            </p>
          </div>

          <ProductPicker products={(products ?? []) as { id: string; name: string; slug: string }[]} selected={selectedIds} />

          <div className="flex items-center justify-between pt-3 border-t border-ink-200/60">
            <button type="submit" className="btn-primary">Guardar cambios</button>
          </div>
        </form>

        <div className="space-y-4">
          <AdminBlogCover postId={post.id} initialPath={post.cover_image_path} />

          <form action={deleteBlogPostAction} className="card p-5">
            <div className="label mb-2 text-danger">Zona peligrosa</div>
            <p className="text-xs text-ink-600 mb-3">Elimina permanentemente esta entrada.</p>
            <input type="hidden" name="id" value={post.id} />
            <button type="submit" className="text-xs text-danger hover:underline">
              Eliminar entrada
            </button>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}

function ProductPicker({
  products,
  selected,
}: {
  products: { id: string; name: string; slug: string }[];
  selected: Set<string>;
}) {
  // Server-rendered: enviamos un input hidden con CSVs. Para edición simple,
  // listamos checkboxes y construimos product_ids al vuelo con un script inline NO posible.
  // Usamos un input "product_ids" como CSV armado por checkboxes via JS opcional;
  // alternativa server-only: usar campos múltiples con mismo name. Vamos por campos múltiples
  // bajo un name único product_ids[] — el server action lee como string y splittea.
  // Para mantenerlo robusto, dejamos checkboxes que setean inputs hidden vía un script chiquito.
  // Más simple: enviar todos los IDs seleccionados como CSV via campo oculto + checkboxes que lo actualizan.
  // Para evitar JS extra: usamos N inputs hidden idénticos al pasar por una server action que los combine.
  // Hack pragmático: cada checkbox value=id y name="__pid". El action los junta en CSV abajo.
  return (
    <div>
      <div className="label">Productos relacionados</div>
      <p className="mt-1 text-2xs text-ink-600">Aparecerán al final del post como "Lo que usamos".</p>
      {products.length === 0 ? (
        <p className="mt-3 text-xs text-ink-600">No hay productos publicados todavía.</p>
      ) : (
        <div className="mt-2 max-h-56 overflow-y-auto rounded-md border border-ink-200/60 p-3 space-y-1.5 bg-surface">
          {products.map((p) => {
            const checked = selected.has(p.id);
            return (
              <label key={p.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="__pid"
                  value={p.id}
                  defaultChecked={checked}
                  className="h-4 w-4 accent-primary"
                />
                <span>{p.name} <span className="text-2xs text-ink-600 font-mono">/{p.slug}</span></span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
