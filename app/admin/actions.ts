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

export async function revalidateHomeAction() {
  revalidatePath('/');
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

export async function saveBlogPostAction(formData: FormData) {
  const sb = await createSupabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (u.user?.user_metadata?.role !== 'admin') redirect('/admin/login');

  const id = String(formData.get('id') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const rawSlug = String(formData.get('slug') ?? '').trim();
  const slug = slugify(rawSlug || title);
  const status = String(formData.get('status') ?? 'draft') as 'active' | 'draft' | 'archived';
  const product_ids = formData
    .getAll('__pid')
    .map(String)
    .filter(Boolean);

  const payload: Record<string, unknown> = {
    title,
    slug,
    excerpt: String(formData.get('excerpt') ?? '') || null,
    body: String(formData.get('body') ?? ''),
    project_location: String(formData.get('project_location') ?? '') || null,
    status,
    product_ids,
  };

  // Asigna published_at la primera vez que pasa a active.
  if (status === 'active') {
    if (id) {
      const { data: existing } = await sb.from('blog_posts').select('published_at').eq('id', id).maybeSingle();
      if (!existing?.published_at) payload.published_at = new Date().toISOString();
    } else {
      payload.published_at = new Date().toISOString();
    }
  }

  if (id) {
    await sb.from('blog_posts').update(payload).eq('id', id);
    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    redirect(`/admin/blog/${id}`);
  } else {
    const { data, error } = await sb.from('blog_posts').insert(payload).select('id').single();
    if (error) redirect('/admin/blog?error=' + encodeURIComponent(error.message));
    revalidatePath('/');
    revalidatePath('/blog');
    redirect(`/admin/blog/${data!.id}`);
  }
}

export async function deleteBlogPostAction(formData: FormData) {
  const sb = await createSupabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (u.user?.user_metadata?.role !== 'admin') redirect('/admin/login');
  const id = String(formData.get('id') ?? '');
  await sb.from('blog_posts').delete().eq('id', id);
  revalidatePath('/');
  revalidatePath('/blog');
  redirect('/admin/blog');
}

export async function deleteSubscriberAction(formData: FormData) {
  const sb = await createSupabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (u.user?.user_metadata?.role !== 'admin') redirect('/admin/login');
  await sb.from('newsletter_subscribers').delete().eq('id', String(formData.get('id') ?? ''));
  redirect('/admin/newsletter');
}

export async function bulkProductsAction(formData: FormData) {
  const sb = await createSupabaseServer();
  const { data: u } = await sb.auth.getUser();
  if (u.user?.user_metadata?.role !== 'admin') redirect('/admin/login');

  const op = String(formData.get('op') ?? '');
  const ids = formData.getAll('id').map(String).filter(Boolean);
  if (ids.length === 0) redirect('/admin/productos');

  let patch: Record<string, unknown> | null = null;
  switch (op) {
    case 'publish': patch = { status: 'active' }; break;
    case 'unpublish': patch = { status: 'draft' }; break;
    case 'archive': patch = { status: 'archived' }; break;
    case 'feature': patch = { featured: true }; break;
    case 'unfeature': patch = { featured: false }; break;
    default: redirect('/admin/productos');
  }

  await sb.from('products').update(patch!).in('id', ids);
  revalidatePath('/');
  revalidatePath('/catalogo');
  redirect('/admin/productos');
}

export async function deleteCategoryAction(formData: FormData) {
  const sb = await createSupabaseServer();
  await sb.from('categories').delete().eq('id', String(formData.get('id')));
  revalidatePath('/catalogo');
  redirect('/admin/categorias');
}
