'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServer } from '@/lib/supabase/server';
import { isOrderStatus } from '@/lib/orders/status';

export async function updateOrderAction(formData: FormData) {
  const sb = await createSupabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (u.user?.user_metadata?.role !== 'admin') redirect('/admin/login');

  const id = String(formData.get('id') ?? '');
  const status = formData.get('status');
  const notes = String(formData.get('admin_notes') ?? '').trim();
  if (!id || !isOrderStatus(status)) redirect('/admin/pedidos');

  await sb
    .from('orders')
    .update({ status, admin_notes: notes || null, updated_at: new Date().toISOString() })
    .eq('id', id);

  revalidatePath('/admin/pedidos');
  redirect(`/admin/pedidos/${id}?saved=1`);
}
