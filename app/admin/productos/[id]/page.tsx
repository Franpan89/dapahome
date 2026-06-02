import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/guard';
import { AdminShell } from '@/components/AdminShell';
import { saveProductAction, deleteProductAction } from '@/app/admin/actions';
import { AdminImageManager } from '@/components/admin/AdminImageManager';
import { AdminVariantManager } from '@/components/admin/AdminVariantManager';

export const dynamic = 'force-dynamic';

export default async function ProductEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === 'new';
  const { user, supabase } = await requireAdmin();

  const [productRes, categoriesRes] = await Promise.all([
    isNew
      ? Promise.resolve({ data: null })
      : supabase.from('products').select('*, images:product_images(*), variants:product_variants(*)').eq('id', id).maybeSingle(),
    supabase.from('categories').select('*').order('sort_order'),
  ]);
  if (!isNew && !productRes.data) notFound();
  const product: any = productRes.data;
  const categories = categoriesRes.data ?? [];

  return (
    <AdminShell email={user.email}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="label">{isNew ? 'Nuevo' : 'Editar'}</div>
          <h1 className="font-display text-3xl tracking-tight">{isNew ? 'Nuevo producto' : product?.name}</h1>
        </div>
        {!isNew && (
          <form action={deleteProductAction}>
            <input type="hidden" name="id" value={product.id} />
            <button className="text-sm text-danger hover:underline">Eliminar</button>
          </form>
        )}
      </div>

      <form action={saveProductAction} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <input type="hidden" name="id" value={isNew ? '' : product.id} />

        <section className="card p-6 space-y-4">
          <h2 className="font-display text-xl">General</h2>
          <Field label="Nombre" name="name" defaultValue={product?.name ?? ''} required />
          <Field label="Slug (URL)" name="slug" defaultValue={product?.slug ?? ''} required hint="Ej: lampara-aria. Se usará en /producto/<slug>" />
          <div>
            <label className="label">Descripción</label>
            <textarea name="description" defaultValue={product?.description ?? ''} className="input mt-1.5 min-h-[140px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio base" name="base_price" type="number" step="0.01" defaultValue={String(product?.base_price ?? 0)} required />
            <Field label="Moneda" name="currency" defaultValue={product?.currency ?? 'USD'} />
          </div>
        </section>

        <aside className="space-y-6">
          <section className="card p-6 space-y-4">
            <h2 className="font-display text-lg">Publicación</h2>
            <div>
              <label className="label">Estado</label>
              <select name="status" defaultValue={product?.status ?? 'draft'} className="input mt-1.5">
                <option value="draft">Borrador</option>
                <option value="active">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
            <div>
              <label className="label">Categoría</label>
              <select name="category_id" defaultValue={product?.category_id ?? ''} className="input mt-1.5">
                <option value="">Sin categoría</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} className="h-4 w-4 accent-primary" />
              Destacado en home
            </label>
          </section>

          <button type="submit" className="btn-primary w-full">Guardar cambios</button>
        </aside>
      </form>

      {!isNew && (
        <>
          <section className="mt-10">
            <h2 className="font-display text-xl mb-3">Imágenes</h2>
            <AdminImageManager productId={product.id} images={product.images ?? []} variants={product.variants ?? []} />
          </section>
          <section className="mt-10">
            <h2 className="font-display text-xl mb-3">Variantes</h2>
            <AdminVariantManager productId={product.id} variants={product.variants ?? []} />
          </section>
        </>
      )}
    </AdminShell>
  );
}

function Field({
  label, hint, ...props
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="label">{label}</label>
      <input {...props} className="input mt-1.5" />
      {hint && <p className="mt-1 text-2xs text-ink-600">{hint}</p>}
    </div>
  );
}
