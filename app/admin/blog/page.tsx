import Link from 'next/link';
import { requireAdmin } from '@/lib/supabase/guard';
import { AdminShell } from '@/components/AdminShell';

export const dynamic = 'force-dynamic';

export default async function BlogAdminListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { user, supabase } = await requireAdmin();
  const { q } = await searchParams;
  let query = supabase
    .from('blog_posts')
    .select('id, slug, title, status, published_at, updated_at, project_location')
    .order('updated_at', { ascending: false });
  if (q?.trim()) query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%`);
  const { data } = await query;

  return (
    <AdminShell email={user.email}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="label">Contenido</div>
          <h1 className="font-display text-3xl tracking-tight">Blog</h1>
        </div>
        <Link href="/admin/blog/new" className="btn-primary">+ Nueva entrada</Link>
      </div>

      <form className="mb-4 flex gap-2 max-w-md">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar por título o slug…"
          className="input flex-1"
        />
        <button className="btn-primary px-4">Buscar</button>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-100 text-2xs uppercase tracking-wider text-ink-600">
            <tr>
              <th className="text-left px-4 py-3">Título</th>
              <th className="text-left px-4 py-3">Ubicación</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Publicado</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/60">
            {(data ?? []).map((p: any) => (
              <tr key={p.id} className="hover:bg-accent/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-2xs text-ink-600">/blog/{p.slug}</div>
                </td>
                <td className="px-4 py-3 text-ink-600">{p.project_location ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`chip ${p.status === 'active' ? 'bg-success/15 text-success' : 'bg-ink-200/60 text-ink-600'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-600 text-xs">
                  {p.published_at ? new Date(p.published_at).toLocaleDateString('es-EC') : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/blog/${p.id}`} className="text-primary text-sm hover:underline">Editar</Link>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-ink-600">
                Aún no hay entradas. <Link href="/admin/blog/new" className="text-primary hover:underline">Crear la primera</Link>.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
