'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export function CatalogSearch({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(defaultValue);
  const [, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams(params.toString());
    if (query) p.set('q', query);
    else p.delete('q');
    startTransition(() => router.push(`/catalogo?${p.toString()}`));
  }

  return (
    <form onSubmit={submit} className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar lámparas, jarrones, cerraduras…"
        className="w-full rounded-full border border-ink-200 bg-surface pl-12 pr-28 py-3.5 text-sm placeholder:text-ink-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 min-h-[52px]"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-ink-900 px-4 py-2 text-xs font-medium text-white hover:bg-primary"
      >
        Buscar
      </button>
    </form>
  );
}
