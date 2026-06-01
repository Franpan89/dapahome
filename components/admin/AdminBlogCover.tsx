'use client';

import Image from 'next/image';
import { useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import { imageUrl } from '@/lib/supabase/image';

export function AdminBlogCover({
  postId,
  initialPath,
}: {
  postId: string;
  initialPath: string | null;
}) {
  const sb = createSupabaseBrowser();
  const [path, setPath] = useState<string | null>(initialPath);
  const [uploading, setUploading] = useState(false);

  async function onPick(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const newPath = `blog/${postId}-${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await sb.storage.from('products').upload(newPath, file, { upsert: false });
      if (upErr) { alert('Error subiendo: ' + upErr.message); return; }
      // borra anterior si existía y no era una URL externa
      if (path && !path.startsWith('http')) {
        await sb.storage.from('products').remove([path]);
      }
      await sb.from('blog_posts').update({ cover_image_path: newPath }).eq('id', postId);
      setPath(newPath);
    } finally {
      setUploading(false);
    }
  }

  async function clear() {
    if (!confirm('¿Quitar la imagen de portada?')) return;
    if (path && !path.startsWith('http')) {
      await sb.storage.from('products').remove([path]);
    }
    await sb.from('blog_posts').update({ cover_image_path: null }).eq('id', postId);
    setPath(null);
  }

  return (
    <div className="card p-5">
      <div className="label mb-3">Imagen de portada</div>
      {path ? (
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-ink-100">
          <Image src={imageUrl(path)} alt="" fill sizes="400px" className="object-cover" />
        </div>
      ) : (
        <div className="aspect-[16/10] grid place-items-center rounded-xl border border-dashed border-ink-200 bg-ink-100 text-sm text-ink-600">
          Sin imagen
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="btn-primary cursor-pointer text-xs px-3 py-2 min-h-0">
          {uploading ? 'Subiendo…' : path ? 'Cambiar imagen' : 'Subir imagen'}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => onPick(e.target.files)}
            className="hidden"
          />
        </label>
        {path && (
          <button onClick={clear} className="text-xs text-danger hover:underline">
            Quitar
          </button>
        )}
      </div>
      <p className="mt-2 text-2xs text-ink-600">Recomendado: 1600×1000px, JPG/PNG.</p>
    </div>
  );
}
