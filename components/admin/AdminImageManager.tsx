'use client';

import Image from 'next/image';
import { useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import { imageUrl } from '@/lib/supabase/image';
import type { ProductImage, ProductVariant } from '@/lib/supabase/types';

export function AdminImageManager({
  productId,
  images: initial,
  variants = [],
}: {
  productId: string;
  images: ProductImage[];
  variants?: ProductVariant[];
}) {
  const sb = createSupabaseBrowser();
  const [images, setImages] = useState<ProductImage[]>(
    [...initial].sort((a, b) => a.sort_order - b.sort_order),
  );
  const [uploading, setUploading] = useState(false);

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const next: ProductImage[] = [...images];
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `${productId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await sb.storage.from('products').upload(path, file, { upsert: false });
        if (upErr) { alert('Error subiendo: ' + upErr.message); continue; }
        const { data, error } = await sb
          .from('product_images')
          .insert({
            product_id: productId,
            storage_path: path,
            alt: file.name.replace(/\.[^/.]+$/, ''),
            sort_order: next.length,
            is_primary: next.length === 0,
          })
          .select('*')
          .single();
        if (error) { alert(error.message); continue; }
        next.push(data as ProductImage);
      }
      setImages(next);
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(id: string) {
    if (!confirm('¿Eliminar esta imagen?')) return;
    const img = images.find((i) => i.id === id);
    if (!img) return;
    if (!img.storage_path.startsWith('http')) {
      await sb.storage.from('products').remove([img.storage_path]);
    }
    await sb.from('product_images').delete().eq('id', id);
    setImages((prev) => prev.filter((i) => i.id !== id));
  }

  async function setPrimary(id: string) {
    await sb.from('product_images').update({ is_primary: false }).eq('product_id', productId);
    await sb.from('product_images').update({ is_primary: true }).eq('id', id);
    setImages((prev) => prev.map((i) => ({ ...i, is_primary: i.id === id })));
  }

  async function setAlt(id: string, alt: string) {
    await sb.from('product_images').update({ alt }).eq('id', id);
    setImages((prev) => prev.map((i) => (i.id === id ? { ...i, alt } : i)));
  }

  async function setVariant(id: string, variantId: string | null) {
    await sb.from('product_images').update({ variant_id: variantId }).eq('id', id);
    setImages((prev) => prev.map((i) => (i.id === id ? { ...i, variant_id: variantId } : i)));
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = images.findIndex((i) => i.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= images.length) return;
    const next = [...images];
    [next[idx], next[j]] = [next[j], next[idx]];
    setImages(next);
    await Promise.all(next.map((img, k) => sb.from('product_images').update({ sort_order: k }).eq('id', img.id)));
  }

  return (
    <div className="card p-6">
      <label className="block">
        <span className="label">Agregar imágenes</span>
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
        {images.map((img, idx) => (
          <li key={img.id} className="group relative rounded-md overflow-hidden border border-ink-200">
            <div className="relative aspect-square bg-ink-100">
              <Image src={imageUrl(img.storage_path)} alt={img.alt ?? ''} fill sizes="200px" className="object-cover" />
              {img.is_primary && (
                <span className="absolute top-2 left-2 chip bg-primary text-white">Principal</span>
              )}
            </div>
            <div className="p-2 space-y-2 bg-surface">
              <input
                defaultValue={img.alt ?? ''}
                onBlur={(e) => setAlt(img.id, e.target.value)}
                placeholder="Texto alternativo"
                className="w-full text-xs px-2 py-1 border border-ink-200 rounded"
              />
              {variants.length > 0 && (
                <select
                  value={img.variant_id ?? ''}
                  onChange={(e) => setVariant(img.id, e.target.value || null)}
                  className="w-full text-xs px-2 py-1 border border-ink-200 rounded bg-white"
                  title="Variante asociada"
                >
                  <option value="">Imagen general</option>
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex flex-wrap gap-1">
                {!img.is_primary && (
                  <button onClick={() => setPrimary(img.id)} className="text-2xs px-2 py-1 rounded bg-ink-100 hover:bg-primary hover:text-white">Hacer principal</button>
                )}
                <button onClick={() => move(img.id, -1)} disabled={idx === 0} className="text-2xs px-2 py-1 rounded bg-ink-100 disabled:opacity-40">↑</button>
                <button onClick={() => move(img.id, 1)} disabled={idx === images.length - 1} className="text-2xs px-2 py-1 rounded bg-ink-100 disabled:opacity-40">↓</button>
                <button onClick={() => removeImage(img.id)} className="text-2xs px-2 py-1 rounded text-danger hover:bg-danger/10">Eliminar</button>
              </div>
            </div>
          </li>
        ))}
        {images.length === 0 && (
          <li className="col-span-full text-center text-sm text-ink-600 py-8">
            Aún no hay imágenes. Sube al menos una.
          </li>
        )}
      </ul>
    </div>
  );
}
