import { requireAdmin } from '@/lib/supabase/guard';
import { AdminShell } from '@/components/AdminShell';
import { saveBlogPostAction } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

export default async function NewBlogPostPage() {
  const { user } = await requireAdmin();

  return (
    <AdminShell email={user.email}>
      <div className="mb-6">
        <div className="label">Contenido</div>
        <h1 className="font-display text-3xl tracking-tight">Nueva entrada</h1>
        <p className="mt-1 text-sm text-ink-600">
          Crea primero el borrador con título; podrás subir la imagen y enlazar productos en el siguiente paso.
        </p>
      </div>

      <form action={saveBlogPostAction} className="card p-6 space-y-4 max-w-2xl">
        <div>
          <label htmlFor="title" className="label">Título <span className="text-danger">*</span></label>
          <input id="title" name="title" required className="input mt-1.5" placeholder="Cómo iluminamos una sala en Cumbayá" />
        </div>
        <div>
          <label htmlFor="slug" className="label">Slug (opcional)</label>
          <input id="slug" name="slug" className="input mt-1.5 font-mono text-xs" placeholder="Se genera automáticamente desde el título" />
        </div>
        <div>
          <label htmlFor="excerpt" className="label">Extracto</label>
          <textarea id="excerpt" name="excerpt" className="input mt-1.5 min-h-[80px]" placeholder="Resumen breve (1-2 frases)." />
        </div>
        <div>
          <label htmlFor="status" className="label">Estado</label>
          <select id="status" name="status" defaultValue="draft" className="input mt-1.5">
            <option value="draft">Borrador</option>
            <option value="active">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </div>
        <input type="hidden" name="body" value="" />
        <button className="btn-primary w-full">Crear borrador</button>
      </form>
    </AdminShell>
  );
}
