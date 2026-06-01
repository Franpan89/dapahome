'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';

const STATUS_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Publicados' },
  { value: 'draft', label: 'Borradores' },
  { value: 'archived', label: 'Archivados' },
] as const;

export function AdminProductsToolbar({ q, status }: { q: string; status: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [local, setLocal] = useState(q);
  const [, startTransition] = useTransition();

  function pushWith(mut: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(params.toString());
    mut(p);
    startTransition(() => router.push(`${pathname}?${p.toString()}`));
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    pushWith((p) => {
      if (local) p.set('q', local);
      else p.delete('q');
    });
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <form onSubmit={onSearch} className="flex items-center gap-2 max-w-md w-full">
        <label htmlFor="admin-q" className="sr-only">Buscar productos</label>
        <input
          id="admin-q"
          type="search"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="Buscar por nombre o slug…"
          className="input flex-1"
        />
        <button type="submit" className="btn-primary px-4">Buscar</button>
        {q && (
          <button
            type="button"
            onClick={() => { setLocal(''); pushWith((p) => p.delete('q')); }}
            className="text-xs text-ink-600 hover:text-danger"
          >
            Limpiar
          </button>
        )}
      </form>

      <div role="tablist" aria-label="Filtrar por estado" className="inline-flex rounded-lg bg-ink-100 p-1">
        {STATUS_TABS.map((t) => {
          const active = (status || 'all') === t.value;
          return (
            <button
              key={t.value}
              role="tab"
              aria-selected={active}
              onClick={() =>
                pushWith((p) => {
                  if (t.value === 'all') p.delete('status');
                  else p.set('status', t.value);
                })
              }
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                active ? 'bg-surface text-ink-900 shadow-sm' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
