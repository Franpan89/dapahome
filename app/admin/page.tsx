import Link from 'next/link';
import { requireAdmin } from '@/lib/supabase/guard';
import { AdminShell } from '@/components/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const { user, supabase } = await requireAdmin();

  const [
    { count: total },
    { count: active },
    { count: drafts },
    { count: archived },
    { count: featured },
    { count: categoriesCount },
    { count: installationsCount },
    { data: recent },
    { data: allProducts },
    { data: productImages },
    { data: productVariants },
  ] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'archived'),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('featured', true),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('installations').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id, name, slug, status, updated_at').order('updated_at', { ascending: false }).limit(8),
    supabase.from('products').select('id').eq('status', 'active'),
    supabase.from('product_images').select('product_id'),
    supabase.from('product_variants').select('product_id'),
  ]);

  const productIds = new Set((allProducts ?? []).map((p) => p.id));
  const productsWithImages = new Set((productImages ?? []).map((i) => i.product_id));
  const productsWithVariants = new Set((productVariants ?? []).map((v) => v.product_id));
  const noImage = [...productIds].filter((id) => !productsWithImages.has(id)).length;
  const noVariants = [...productIds].filter((id) => !productsWithVariants.has(id)).length;

  return (
    <AdminShell email={user.email}>
      <header className="mb-8">
        <div className="label">Resumen</div>
        <h1 className="mt-1 font-display text-4xl tracking-tight">Hola{user.user_metadata?.name ? `, ${user.user_metadata.name}` : ''}.</h1>
        <p className="mt-2 text-ink-600">Aquí ves el estado del catálogo.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Productos totales" value={total ?? 0} />
        <StatCard label="Publicados" value={active ?? 0} accent />
        <StatCard label="Borradores" value={drafts ?? 0} />
        <StatCard label="Archivados" value={archived ?? 0} />
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Destacados" value={featured ?? 0} tone="secondary" />
        <StatCard label="Categorías" value={categoriesCount ?? 0} tone="muted" />
        <StatCard label="Instalaciones (galería)" value={installationsCount ?? 0} tone="muted" />
        <StatCard
          label="Sin imagen / sin variantes"
          value={`${noImage} / ${noVariants}`}
          tone={noImage > 0 || noVariants > 0 ? 'warning' : 'muted'}
          hint="Productos publicados que necesitan atención"
        />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
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
        </div>

        <div>
          <h2 className="font-display text-2xl tracking-tight mb-4">Atajos</h2>
          <div className="grid gap-2">
            <ShortcutLink href="/admin/productos/new" label="Crear producto" />
            <ShortcutLink href="/admin/instalaciones" label="Subir foto de instalación" />
            <ShortcutLink href="/admin/categorias" label="Editar categorías" />
            <ShortcutLink href="/admin/configuracion" label="Configurar sitio" />
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  accent,
  tone,
  hint,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
  tone?: 'secondary' | 'muted' | 'warning';
  hint?: string;
}) {
  const cls = accent
    ? 'bg-brand-gradient text-white border-transparent'
    : tone === 'secondary'
      ? 'bg-secondary/15 border-secondary/20'
      : tone === 'warning'
        ? 'bg-danger/10 border-danger/30'
        : '';
  const labelCls = accent ? 'text-white/80' : tone === 'warning' ? 'text-danger' : '';
  return (
    <div className={`card p-5 ${cls}`}>
      <div className={`label ${labelCls}`}>{label}</div>
      <div className="mt-2 font-display text-4xl tabular-nums">{value}</div>
      {hint && <p className="mt-1 text-2xs text-ink-600">{hint}</p>}
    </div>
  );
}

function ShortcutLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md border border-ink-200/60 bg-surface px-4 py-3 text-sm hover:border-primary hover:text-primary transition-colors"
    >
      <span>{label}</span>
      <span aria-hidden>→</span>
    </Link>
  );
}
