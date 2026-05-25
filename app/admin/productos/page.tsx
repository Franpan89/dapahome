import Link from 'next/link';
import { requireAdmin } from '@/lib/supabase/guard';
import { AdminShell } from '@/components/AdminShell';
import { formatMoney } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function ProductsListPage() {
  const { user, supabase } = await requireAdmin();
  const { data } = await supabase
    .from('products')
    .select('id, name, slug, status, base_price, currency, featured, updated_at, category:categories(name)')
    .order('updated_at', { ascending: false });

  return (
    <AdminShell email={user.email}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="label">Catálogo</div>
          <h1 className="font-display text-3xl tracking-tight">Productos</h1>
        </div>
        <Link href="/admin/productos/new" className="btn-primary">+ Nuevo producto</Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-100 text-2xs uppercase tracking-wider text-ink-600">
            <tr>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Categoría</th>
              <th className="text-right px-4 py-3">Precio</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/60">
            {(data ?? []).map((p: any) => (
              <tr key={p.id} className="hover:bg-accent/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{p.name} {p.featured && <span className="ml-1 text-secondary">◆</span>}</div>
                  <div className="text-2xs text-ink-600">/{p.slug}</div>
                </td>
                <td className="px-4 py-3 text-ink-600">{p.category?.name ?? '—'}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{formatMoney(p.base_price, p.currency)}</td>
                <td className="px-4 py-3">
                  <span className={`chip ${p.status === 'active' ? 'bg-success/15 text-success' : 'bg-ink-200/60 text-ink-600'}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/productos/${p.id}`} className="text-primary text-sm hover:underline">Editar</Link>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-ink-600">Aún no hay productos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
