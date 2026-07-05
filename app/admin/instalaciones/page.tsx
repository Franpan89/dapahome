import { requireAdmin } from '@/lib/supabase/guard';
import { AdminShell } from '@/components/AdminShell';
import { AdminInstallationsManager } from '@/components/admin/AdminInstallationsManager';
import type { Installation } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function InstallationsAdminPage() {
  const { user, supabase } = await requireAdmin();
  const { data } = await supabase
    .from('installations')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <AdminShell email={user.email}>
      <div className="mb-6">
        <div className="label">Galería</div>
        <h1 className="font-display text-3xl tracking-tight">Instalaciones</h1>
        <p className="mt-2 text-sm text-ink-600 max-w-xl">
          Fotos y videos reales de productos Dapa Home instalados en hogares y comercios.
          Aparecen en el home en la sección <em>“Nuestras lámparas en el mercado”</em>.
        </p>
      </div>
      <AdminInstallationsManager items={(data ?? []) as Installation[]} />
    </AdminShell>
  );
}
