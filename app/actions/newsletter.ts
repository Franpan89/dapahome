'use server';

import { createSupabaseServer } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/demo';

export async function subscribeNewsletter(formData: FormData): Promise<{ ok: boolean; message: string }> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const source = String(formData.get('source') ?? 'footer');

  if (!email) return { ok: false, message: 'Ingresa tu email.' };
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) return { ok: false, message: 'Email inválido.' };

  if (!isSupabaseConfigured()) {
    return { ok: true, message: '¡Gracias! (modo demo, no se guardó realmente)' };
  }

  try {
    const sb = await createSupabaseServer();
    const { error } = await sb.from('newsletter_subscribers').insert({ email, source });
    if (error) {
      // unique violation → ya suscrito; lo tratamos como éxito silencioso
      if (error.code === '23505') return { ok: true, message: '¡Ya estabas suscrito(a)!' };
      return { ok: false, message: 'No pudimos guardar tu email. Intenta más tarde.' };
    }
    return { ok: true, message: '¡Listo! Te avisaremos de novedades.' };
  } catch {
    return { ok: false, message: 'Error al guardar. Intenta más tarde.' };
  }
}
