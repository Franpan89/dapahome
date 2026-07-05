import { requireAdmin } from '@/lib/supabase/guard';
import { AdminShell } from '@/components/AdminShell';
import { AdminCategoryImage } from '@/components/admin/AdminCategoryImage';
import { saveCategoryAction, deleteCategoryAction } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

export default async function CategoriesAdminPage() {
  const { user, supabase } = await requireAdmin();
  const { data } = await supabase.from('categories').select('*').order('sort_order');

  return (
    <AdminShell email={user.email}>
      <div className="mb-6">
        <div className="label">Catálogo</div>
        <h1 className="font-display text-3xl tracking-tight">Categorías</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-100 text-2xs uppercase tracking-wider text-ink-600">
              <tr>
                <th className="text-left px-4 py-3">Imagen para el home</th>
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-right px-4 py-3">Orden</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200/60">
              {(data ?? []).map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <AdminCategoryImage categoryId={c.id} initialPath={c.hero_image_path} />
                  </td>
                  <td className="px-4 py-3">
                    <form action={saveCategoryAction} className="grid gap-2 grid-cols-[1fr_1fr_80px_auto]">
                      <input type="hidden" name="id" value={c.id} />
                      <input name="name" defaultValue={c.name} className="px-2 py-1 border border-ink-200 rounded" />
                      <input name="slug" defaultValue={c.slug} className="px-2 py-1 border border-ink-200 rounded font-mono text-xs" />
                      <input type="number" name="sort_order" defaultValue={c.sort_order} className="px-2 py-1 border border-ink-200 rounded text-right" />
                      <button className="text-xs text-primary hover:underline">Guardar</button>
                    </form>
                  </td>
                  <td colSpan={3} className="px-4 py-3 text-right">
                    <form action={deleteCategoryAction} className="inline">
                      <input type="hidden" name="id" value={c.id} />
                      <button className="text-2xs text-danger hover:underline">Eliminar</button>
                    </form>
                  </td>
                </tr>
              ))}
              {(!data || data.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-600">Sin categorías.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <form action={saveCategoryAction} className="card p-6 space-y-3 self-start">
          <h2 className="font-display text-xl">Nueva categoría</h2>
          <div>
            <label className="label">Nombre</label>
            <input name="name" required className="input mt-1.5" />
          </div>
          <div>
            <label className="label">Slug</label>
            <input name="slug" required className="input mt-1.5 font-mono" />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea name="description" className="input mt-1.5" />
          </div>
          <div>
            <label className="label">Orden</label>
            <input type="number" name="sort_order" defaultValue={10} className="input mt-1.5" />
          </div>
          <button className="btn-primary w-full">Crear</button>
        </form>
      </div>
    </AdminShell>
  );
}
