'use client';

import Image from 'next/image';
import { useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import { imageUrl } from '@/lib/supabase/image';
import type { Installation } from '@/lib/supabase/types';
import { revalidateHomeAction } from '@/app/admin/actions';

export function AdminInstallationsManager({ items: initial }: { items: Installation[] }) {
  const sb = createSupabaseBrowser();
  const [items, setItems] = useState<Installation[]>(
    [...initial].sort((a, b) => a.sort_order - b.sort_order),
  );
  const [uploading, setUploading] = useState(false);

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const next: Installation[] = [...items];
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `installations/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await sb.storage.from('products').upload(path, file, { upsert: false });
        if (upErr) { alert('Error subiendo: ' + upErr.message); continue; }
        const { data, error } = await sb
          .from('installations')
          .insert({
            storage_path: path,
            alt: file.name.replace(/\.[^/.]+$/, ''),
            sort_order: next.length,
          })
          .select('*')
          .single();
        if (error) { alert(error.message); continue; }
        next.push(data as Installation);
      }
      setItems(next);
      revalidateHomeAction();
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar esta foto?')) return;
    const it = items.find((i) => i.id === id);
    if (!it) return;
    if (!it.storage_path.startsWith('http')) {
      await sb.storage.from('products').remove([it.storage_path]);
    }
    await sb.from('installations').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    revalidateHomeAction();
  }

  async function update(id: string, patch: Partial<Installation>) {
    await sb.from('installations').update(patch).eq('id', id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    revalidateHomeAction();
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    setItems(next);
    await Promise.all(next.map((it, k) => sb.from('installations').update({ sort_order: k }).eq('id', it.id)));
    revalidateHomeAction();
  }

  return (
    <div className="card p-6">
      <label className="block">
        <span className="label">Agregar fotos de instalaciones</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onUpload(e.target.files)}
          disabled={uploading}
          className="block w-full mt-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white hover:file:bg-primary-soft file:cursor-pointer"
        />
        {uploading && <p className="mt-2 text-xs text-ink-600">Subiendo…</p>}
      </label>

      <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map((it, idx) => (
          <li key={it.id} className="group relative rounded-md overflow-hidden border border-ink-200">
            <div className="relative aspect-square bg-ink-100">
              <Image src={imageUrl(it.storage_path)} alt={it.alt ?? ''} fill sizes="240px" className="object-cover" />
            </div>
            <div className="p-2 space-y-2 bg-surface">
              <input
                defaultValue={it.caption ?? ''}
                onBlur={(e) => update(it.id, { caption: e.target.value })}
                placeholder="Descripción visible (ej. Sala — Quito)"
                className="w-full text-xs px-2 py-1 border border-ink-200 rounded"
              />
              <input
                defaultValue={it.alt ?? ''}
                onBlur={(e) => update(it.id, { alt: e.target.value })}
                placeholder="Texto alternativo (accesibilidad)"
                className="w-full text-xs px-2 py-1 border border-ink-200 rounded"
              />
              <div className="flex flex-wrap gap-1">
                <button onClick={() => move(it.id, -1)} disabled={idx === 0} className="text-2xs px-2 py-1 rounded bg-ink-100 disabled:opacity-40">↑</button>
                <button onClick={() => move(it.id, 1)} disabled={idx === items.length - 1} className="text-2xs px-2 py-1 rounded bg-ink-100 disabled:opacity-40">↓</button>
                <button onClick={() => remove(it.id)} className="text-2xs px-2 py-1 rounded text-danger hover:bg-danger/10">Eliminar</button>
              </div>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="col-span-full text-center text-sm text-ink-600 py-8">
            Aún no hay fotos. Sube tus primeras instalaciones para que aparezcan en el home.
          </li>
        )}
      </ul>
    </div>
  );
}
