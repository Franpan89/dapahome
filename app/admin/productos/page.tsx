import Link from 'next/link';
import { requireAdmin } from '@/lib/supabase/guard';
import { AdminShell } from '@/components/AdminShell';
import { AdminProductsToolbar } from '@/components/admin/AdminProductsToolbar';
import { AdminProductsBulk } from '@/components/admin/AdminProductsBulk';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['active', 'draft', 'archived'] as const;
type StatusFilter = (typeof VALID_STATUSES)[number] | 'all';

export default async function ProductsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { user, supabase } = await requireAdmin();
  const sp = await searchParams;
  const status: StatusFilter = (VALID_STATUSES as readonly string[]).includes(sp.status ?? '')
    ? (sp.status as StatusFilter)
    : 'all';
  const q = sp.q?.trim() ?? '';

  let query = supabase
    .from('products')
    .select('id, name, slug, status, base_price, currency, featured, updated_at, category:categories(name)')
    .order('updated_at', { ascending: false });

  if (status !== 'all') query = query.eq('status', status);
  if (q) query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);

  const { data } = await query;
  const rows = (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    status: p.status,
    base_price: p.base_price,
    currency: p.currency,
    featured: p.featured,
    category: p.category,
  }));

  return (
    <AdminShell email={user.email}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="label">Catálogo</div>
          <h1 className="font-display text-3xl tracking-tight">Productos</h1>
        </div>
        <Link href="/admin/productos/new" className="btn-primary">+ Nuevo producto</Link>
      </div>

      <AdminProductsToolbar q={q} status={status} />

      <div className="mt-4">
        <AdminProductsBulk rows={rows} />
      </div>
    </AdminShell>
  );
}
