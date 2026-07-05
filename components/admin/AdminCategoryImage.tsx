'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import { imageUrl } from '@/lib/supabase/image';
import { revalidateHomeAction } from '@/app/admin/actions';

export function AdminCategoryImage({
  categoryId,
  initialPath,
}: {
  categoryId: string;
  initialPath: string | null;
}) {
  const sb = createSupabaseBrowser();
  const [path, setPath] = useState(initialPath);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const newPath = `categories/${categoryId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await sb.storage.from('products').upload(newPath, file, { upsert: false });
      if (upErr) { alert('Error subiendo imagen: ' + upErr.message); return; }
      const { error } = await sb.from('categories').update({ hero_image_path: newPath }).eq('id', categoryId);
      if (error) { alert(error.message); return; }
      const oldPath = path;
      if (oldPath && !oldPath.startsWith('http')) {
        await sb.storage.from('products').remove([oldPath]);
      }
      setPath(newPath);
      revalidateHomeAction();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function removeImage() {
    if (!path) return;
    if (!confirm('¿Quitar la imagen de esta categoría? Se usará una imagen de producto o un color de respaldo en el home.')) return;
    if (!path.startsWith('http')) {
      await sb.storage.from('products').remove([path]);
    }
    await sb.from('categories').update({ hero_image_path: null }).eq('id', categoryId);
    setPath(null);
    revalidateHomeAction();
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-ink-100 border border-ink-200">
        {path ? (
          <Image src={imageUrl(path)} alt="" fill sizes="56px" className="object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-ink-400">
            <ImageIcon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="space-y-1">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
          className="block w-40 text-2xs file:mr-2 file:rounded file:border-0 file:bg-primary file:px-2 file:py-1 file:text-2xs file:text-white hover:file:bg-primary-soft file:cursor-pointer"
        />
        {uploading && <p className="text-2xs text-ink-600">Subiendo…</p>}
        {path && !uploading && (
          <button type="button" onClick={removeImage} className="text-2xs text-danger hover:underline">
            Quitar imagen
          </button>
        )}
      </div>
    </div>
  );
}

function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}
