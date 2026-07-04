import { requireAdmin } from '@/lib/supabase/guard';
import { listAllTestimonials } from '@/lib/supabase/queries';
import { AdminTestimonialsManager } from '@/components/admin/AdminTestimonialsManager';

export const metadata = { title: 'Testimonios — Admin Dapa Home' };

export default async function AdminTestimonialsPage() {
  await requireAdmin();
  const items = await listAllTestimonials();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold">Testimonios</h1>
        <p className="mt-1 text-sm text-ink-600">
          Gestiona los testimonios que aparecen en la página principal. Los publicados se muestran en el orden que definas.
        </p>
      </div>
      <AdminTestimonialsManager items={items} />
    </div>
  );
}
