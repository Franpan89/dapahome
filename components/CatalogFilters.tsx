'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { Category } from '@/lib/supabase/types';
import { cn } from '@/lib/cn';

export function CatalogFilters({
  categories,
  active,
  q,
}: {
  categories: Category[];
  active?: string;
  q?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(q ?? '');
  const [, startTransition] = useTransition();

  function submitQuery(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams(params.toString());
    if (query) p.set('q', query);
    else p.delete('q');
    startTransition(() => router.push(`/catalogo?${p.toString()}`));
  }

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start space-y-7">
      <form onSubmit={submitQuery} className="space-y-2">
        <label htmlFor="q" className="label">Buscar</label>
        <div className="relative">
          <input
            id="q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Lámpara, jarrón, cerradura…"
            className="input pr-10"
          />
          <button
            type="submit"
            aria-label="Buscar"
            className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded text-ink-600 hover:text-primary"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </form>

      <fieldset className="space-y-2">
        <legend className="label mb-2">Categorías</legend>
        <ul className="space-y-1">
          <li>
            <Link
              href="/catalogo"
              className={cn(
                'block rounded-md px-3 py-2 text-sm transition-colors',
                !active ? 'bg-primary text-white' : 'hover:bg-ink-200/40',
              )}
            >
              Todo el catálogo
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/catalogo/${c.slug}`}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm transition-colors',
                  active === c.slug ? 'bg-primary text-white' : 'hover:bg-ink-200/40',
                )}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </fieldset>

      <div className="rounded-lg bg-accent p-4">
        <div className="label">¿Buscas algo a medida?</div>
        <p className="mt-1 text-sm text-ink-900/80">
          Escríbenos y armamos tu pedido con un asesor.
        </p>
        <a
          href="https://wa.me/593998001894"
          target="_blank"
          rel="noopener"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Hablar por WhatsApp →
        </a>
      </div>
    </aside>
  );
}
