'use client';

import Image from 'next/image';
import { useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import { imageUrl } from '@/lib/supabase/image';
import { saveSettingAction } from '@/app/admin/actions';
import type { HeroSlide } from '@/lib/supabase/types';

const EMPTY_SLIDE: HeroSlide = { eyebrow: '', title: '', subtitle: '', image_path: null };

export function HeroSlidesForm({ current }: { current: { slides: HeroSlide[] } }) {
  const sb = createSupabaseBrowser();
  const [slides, setSlides] = useState<HeroSlide[]>(current.slides.length ? current.slides : [EMPTY_SLIDE]);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  function update(i: number, patch: Partial<HeroSlide>) {
    setSlides((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function addSlide() {
    setSlides((prev) => [...prev, { ...EMPTY_SLIDE }]);
  }

  async function removeSlide(i: number) {
    if (slides.length <= 1) { alert('Debe quedar al menos una diapositiva.'); return; }
    const slide = slides[i];
    if (slide.image_path && !slide.image_path.startsWith('http')) {
      await sb.storage.from('products').remove([slide.image_path]);
    }
    setSlides((prev) => prev.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    setSlides((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function onUpload(i: number, file: File | null) {
    if (!file) return;
    setUploadingIdx(i);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `hero/${crypto.randomUUID()}.${ext}`;
      const { error } = await sb.storage.from('products').upload(path, file, { upsert: false });
      if (error) { alert('Error subiendo imagen: ' + error.message); return; }
      const oldPath = slides[i].image_path;
      if (oldPath && !oldPath.startsWith('http')) {
        await sb.storage.from('products').remove([oldPath]);
      }
      update(i, { image_path: path });
    } finally {
      setUploadingIdx(null);
    }
  }

  async function removeImage(i: number) {
    const path = slides[i].image_path;
    if (!path) return;
    if (!path.startsWith('http')) {
      await sb.storage.from('products').remove([path]);
    }
    update(i, { image_path: null });
  }

  async function save() {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set('key', 'hero');
      fd.set('value', JSON.stringify({ slides }));
      await saveSettingAction(fd);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-6 space-y-5 lg:col-span-2">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-xl">Hero del home</h2>
          <p className="mt-1 text-xs text-ink-600">
            Si agregas más de una diapositiva, rotan automáticamente cada pocos segundos. Si una
            diapositiva no tiene imagen propia, se usa la foto del producto destacado como respaldo
            (solo en la primera).
          </p>
        </div>
        <button type="button" onClick={addSlide} className="btn-outline whitespace-nowrap">+ Diapositiva</button>
      </div>

      <div className="space-y-4">
        {slides.map((slide, i) => (
          <div key={i} className="rounded-xl border border-ink-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="label">Diapositiva {i + 1}</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-2xs px-2 py-1 rounded bg-ink-100 disabled:opacity-40">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === slides.length - 1} className="text-2xs px-2 py-1 rounded bg-ink-100 disabled:opacity-40">↓</button>
                <button type="button" onClick={() => removeSlide(i)} className="text-2xs px-2 py-1 rounded text-danger hover:bg-danger/10">Eliminar</button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
              <div>
                <div className="relative h-20 w-full overflow-hidden rounded-md bg-ink-100 border border-ink-200">
                  {slide.image_path ? (
                    <Image src={imageUrl(slide.image_path)} alt="" fill sizes="140px" className="object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-2xs text-ink-400">Sin imagen</div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingIdx === i}
                  onChange={(e) => onUpload(i, e.target.files?.[0] ?? null)}
                  className="mt-1.5 block w-full text-2xs file:mr-2 file:rounded file:border-0 file:bg-primary file:px-2 file:py-1 file:text-2xs file:text-white hover:file:bg-primary-soft file:cursor-pointer"
                />
                {uploadingIdx === i && <p className="mt-1 text-2xs text-ink-600">Subiendo…</p>}
                {slide.image_path && uploadingIdx !== i && (
                  <button type="button" onClick={() => removeImage(i)} className="mt-1 text-2xs text-danger hover:underline">Quitar imagen</button>
                )}
              </div>
              <div className="space-y-2">
                <input
                  value={slide.eyebrow}
                  onChange={(e) => update(i, { eyebrow: e.target.value })}
                  placeholder="Eyebrow (ej. Catálogo 2026)"
                  className="input"
                />
                <textarea
                  value={slide.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                  placeholder="Título"
                  className="input min-h-[60px]"
                />
                <textarea
                  value={slide.subtitle}
                  onChange={(e) => update(i, { subtitle: e.target.value })}
                  placeholder="Subtítulo"
                  className="input min-h-[50px]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={save} disabled={saving} className="btn-primary w-full">
        {saving ? 'Guardando…' : 'Guardar hero'}
      </button>
    </div>
  );
}
