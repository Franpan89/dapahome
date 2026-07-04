'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatMoney } from '@/lib/format';
import type { SearchHit } from '@/app/api/search/route';

export function CatalogSearch({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(defaultValue);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchHits = useCallback(async (q: string) => {
    if (q.length < 2) { setHits([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json() as { results: SearchHit[] };
      setHits(json.results);
      setOpen(json.results.length > 0);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchHits(value), 280);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    const p = new URLSearchParams(params.toString());
    if (query) p.set('q', query); else p.delete('q');
    p.delete('page');
    startTransition(() => router.push(`/catalogo?${p.toString()}`));
  }

  function goToProduct(slug: string) {
    setOpen(false);
    router.push(`/producto/${slug}`);
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={submit} className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
          {loading ? (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => hits.length > 0 && setOpen(true)}
          placeholder="Buscar lámparas, jarrones, cerraduras…"
          className="w-full rounded-full border border-ink-200 bg-surface pl-12 pr-28 py-3.5 text-sm placeholder:text-ink-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 min-h-[52px]"
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-ink-900 px-4 py-2 text-xs font-medium text-white hover:bg-primary"
        >
          Buscar
        </button>
      </form>

      <AnimatePresence>
        {open && hits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl border border-ink-200/80 bg-surface shadow-xl overflow-hidden"
          >
            <ul>
              {hits.map((hit) => (
                <li key={hit.slug}>
                  <button
                    type="button"
                    onClick={() => goToProduct(hit.slug)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-ink-100/60 transition-colors text-left"
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-ink-100">
                      {hit.imageUrl && (
                        <Image src={hit.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-tight truncate">{hit.name}</div>
                      {hit.category && (
                        <div className="text-xs text-ink-500 mt-0.5">{hit.category}</div>
                      )}
                    </div>
                    <div className="text-sm font-semibold tabular-nums flex-shrink-0">
                      {formatMoney(hit.price, hit.currency)}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-ink-200/60 px-4 py-2.5">
              <button
                type="button"
                onClick={submit as unknown as React.MouseEventHandler}
                className="text-xs text-primary hover:underline font-medium"
              >
                Ver todos los resultados para &ldquo;{query}&rdquo; →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
