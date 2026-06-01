import { requireAdmin } from '@/lib/supabase/guard';
import { AdminShell } from '@/components/AdminShell';
import { DeleteSubscriberButton } from '@/components/admin/DeleteSubscriberButton';
import { ExportCsvButton } from '@/components/admin/ExportCsvButton';

export const dynamic = 'force-dynamic';

export default async function NewsletterAdminPage() {
  const { user, supabase } = await requireAdmin();
  const { data } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, source, created_at')
    .order('created_at', { ascending: false });

  const rows = data ?? [];

  return (
    <AdminShell email={user.email}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="label">Audiencia</div>
          <h1 className="font-display text-3xl tracking-tight">Newsletter</h1>
          <p className="mt-1 text-sm text-ink-600">{rows.length} suscriptor(es).</p>
        </div>
        {rows.length > 0 && <ExportCsvButton rows={rows} />}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-100 text-2xs uppercase tracking-wider text-ink-600">
            <tr>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Origen</th>
              <th className="text-left px-4 py-3">Fecha</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/60">
            {rows.map((r: any) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium">{r.email}</td>
                <td className="px-4 py-3 text-ink-600">{r.source ?? '—'}</td>
                <td className="px-4 py-3 text-ink-600">{new Date(r.created_at).toLocaleString('es-EC')}</td>
                <td className="px-4 py-3 text-right">
                  <DeleteSubscriberButton id={r.id} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-ink-600">Aún no hay suscriptores.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
