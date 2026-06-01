'use client';

import { useState } from 'react';
import { saveSettingAction } from '@/app/admin/actions';
import type { PromoBar } from '@/lib/supabase/types';

export function PromoBarForm({ current }: { current: PromoBar }) {
  const [enabled, setEnabled] = useState(current.enabled ?? false);
  const [text, setText] = useState(current.text ?? '');
  const [link, setLink] = useState(current.link ?? '');

  async function action() {
    const fd = new FormData();
    fd.set('key', 'promo_bar');
    fd.set('value', JSON.stringify({ enabled, text, link }));
    await saveSettingAction(fd);
  }

  return (
    <form action={action} className="card p-6 space-y-3 lg:col-span-2">
      <h2 className="font-display text-xl">Banner promocional</h2>
      <p className="text-xs text-ink-600">
        Aparece arriba del header en todas las páginas (excepto admin).
      </p>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <span className="text-sm">Mostrar el banner en el sitio</span>
      </label>

      <div>
        <label htmlFor="promo-text" className="label">Texto</label>
        <input
          id="promo-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input mt-1.5"
          placeholder="Envío gratis en pedidos sobre $80"
        />
      </div>
      <div>
        <label htmlFor="promo-link" className="label">Link (opcional)</label>
        <input
          id="promo-link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="input mt-1.5"
          placeholder="/catalogo o https://wa.me/…"
        />
        <p className="mt-1 text-2xs text-ink-600">
          Si se completa, el banner es clickeable y abre este link.
        </p>
      </div>

      <button type="submit" className="btn-primary w-full">Guardar</button>
    </form>
  );
}
