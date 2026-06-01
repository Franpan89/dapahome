'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { imageUrl } from '@/lib/supabase/image';
import type { ProductImage } from '@/lib/supabase/types';

export function ProductLightbox({
  images,
  open,
  initialIndex,
  onClose,
  productName,
}: {
  images: ProductImage[];
  open: boolean;
  initialIndex: number;
  onClose: () => void;
  productName: string;
}) {
  const [index, setIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(images.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, images.length, onClose]);

  if (!open) return null;
  const current = images[index];
  if (!current) return null;

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0 && index < images.length - 1) setIndex(index + 1);
      if (dx > 0 && index > 0) setIndex(index - 1);
    }
    touchStartX.current = null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galería de ${productName}`}
      className="fixed inset-0 z-[100] bg-ink-900/95 backdrop-blur-sm flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm tabular-nums">{index + 1} / {images.length}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar galería"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div
        className="relative flex-1 select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          key={current.id}
          src={imageUrl(current.storage_path)}
          alt={current.alt ?? productName}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />

        {index > 0 && (
          <button
            type="button"
            onClick={() => setIndex(index - 1)}
            aria-label="Imagen anterior"
            className="hidden sm:grid absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {index < images.length - 1 && (
          <button
            type="button"
            onClick={() => setIndex(index + 1)}
            aria-label="Siguiente imagen"
            className="hidden sm:grid absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3 scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md transition-opacity ${
                i === index ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={imageUrl(img.storage_path)}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
