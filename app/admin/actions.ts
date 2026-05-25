'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const sb = await createSupabaseServer();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  redirect('/admin');
}

export async function logoutAction() {
  const sb = await createSupabaseServer();
  await sb.auth.signOut();
  redirect('/admin/login');
}

export async function saveProductAction(formData: FormData) {
  const sb = await createSupabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (u.user?.user_metadata?.role !== 'admin') redirect('/admin/login');

  const id = String(formData.get('id') ?? '');
  const payload = {
    slug: String(formData.get('slug') ?? '').toLowerCase().replace(/\s+/g, '-'),
    name: String(formData.get('name') ?? ''),
    description: String(formData.get('description') ?? ''),
    category_id: (formData.get('category_id') as string) || null,
    base_price: Number(formData.get('base_price') ?? 0),
    currency: String(formData.get('currency') ?? 'USD'),
    status: String(formData.get('status') ?? 'draft') as 'active' | 'draft' | 'archived',
    featured: formData.get('featured') === 'on',
  };

  if (id) {
    await sb.from('products').update(payload).eq('id', id);
  } else {
    const { data } = await sb.from('products').insert(payload).select('id').single();
    if (data) {
      revalidatePath('/');
      revalidatePath('/catalogo');
      redirect(`/admin/productos/${data.id}`);
    }
  }
  revalidatePath('/');
  revalidatePath('/catalogo');
  revalidatePath(`/producto/${payload.slug}`);
  redirect('/admin/productos');
}

export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const sb = await createSupabaseServer();
  await sb.from('products').delete().eq('id', id);
  revalidatePath('/catalogo');
  redirect('/admin/productos');
}

export async function saveSettingAction(formData: FormData) {
  const sb = await createSupabaseServer();
  const key = String(formData.get('key'));
  const base = JSON.parse(String(formData.get('value') ?? '{}')) as Record<string, unknown>;
  // Sobrescribe con cualquier campo enviado como __<name>
  for (const [k, v] of formData.entries()) {
    if (k.startsWith('__')) base[k.slice(2)] = String(v);
  }
  await sb.from('site_settings').upsert({ key, value: base });
  revalidatePath('/');
  redirect('/admin/configuracion?ok=1');
}

export async function saveCategoryAction(formData: FormData) {
  const sb = await createSupabaseServer();
  const id = String(formData.get('id') ?? '');
  const payload = {
    slug: String(formData.get('slug') ?? '').toLowerCase().replace(/\s+/g, '-'),
    name: String(formData.get('name') ?? ''),
    description: String(formData.get('description') ?? ''),
    sort_order: Number(formData.get('sort_order') ?? 0),
  };
  if (id) await sb.from('categories').update(payload).eq('id', id);
  else await sb.from('categories').insert(payload);
  revalidatePath('/');
  revalidatePath('/catalogo');
  redirect('/admin/categorias');
}

export async function deleteCategoryAction(formData: FormData) {
  const sb = await createSupabaseServer();
  await sb.from('categories').delete().eq('id', String(formData.get('id')));
  revalidatePath('/catalogo');
  redirect('/admin/categorias');
}
