import Link from 'next/link';
import { requireAdmin } from '@/lib/supabase/guard';
import { AdminShell } from '@/components/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const { user, supabase } = await requireAdmin();

  const [{ count: total }, { count: active }, { count: drafts }, { data: recent }] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('products').select('id, name, slug, status, updated_at').order('updated_at', { ascending: false }).limit(8),
  ]);

  return (
    <AdminShell email={user.email}>
      <header className="mb-8">
        <div className="label">Resumen</div>
        <h1 className="mt-1 font-display text-4xl tracking-tight">Hola{user.user_metadata?.name ? `, ${user.user_metadata.name}` : ''}.</h1>
        <p className="mt-2 text-ink-600">Aquí ves el estado del catálogo.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Productos totales" value={total ?? 0} />
        <StatCard label="Publicados" value={active ?? 0} accent />
        <StatCard label="Borradores" value={drafts ?? 0} />
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl tracking-tight">Productos recientes</h2>
          <Link href="/admin/productos" className="text-sm text-primary hover:underline">Ver todos →</Link>
        </div>
        <div className="card divide-y divide-ink-200/60">
          {(recent ?? []).map((p) => (
            <Link
              key={p.id}
              href={`/admin/productos/${p.id}`}
              className="flex items-center justify-between gap-3 p-4 hover:bg-accent/40"
            >
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-ink-600">/{p.slug}</div>
              </div>
              <span className={`chip ${p.status === 'active' ? 'bg-success/15 text-success' : 'bg-ink-200/60 text-ink-600'}`}>
                {p.status}
              </span>
            </Link>
          ))}
          {(!recent || recent.length === 0) && (
            <div className="p-8 text-center text-ink-600">
              Aún no hay productos. <Link href="/admin/productos/new" className="text-primary hover:underline">Crear el primero</Link>.
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`card p-5 ${accent ? 'bg-brand-gradient text-white border-transparent' : ''}`}>
      <div className={`label ${accent ? 'text-white/80' : ''}`}>{label}</div>
      <div className="mt-2 font-display text-4xl tabular-nums">{value}</div>
    </div>
  );
}
