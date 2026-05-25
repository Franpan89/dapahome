import { redirect } from 'next/navigation';
import { createSupabaseServer } from './server';
import { isSupabaseConfigured } from './demo';

export async function requireAdmin() {
  if (!isSupabaseConfigured()) redirect('/admin/login?error=missing-env');
  const sb = await createSupabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user) redirect('/admin/login');
  if (user.user_metadata?.role !== 'admin') redirect('/admin/login?error=unauthorized');
  return { user, supabase: sb };
}
