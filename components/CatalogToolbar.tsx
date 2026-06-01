'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';

const SORT_OPTIONS = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'destacados', label: 'Destacados' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
] as const;

export function CatalogToolbar({
  total,
  q,
  sort,
  priceMin,
  priceMax,
}: {
  total: number;
  q?: string;
  sort?: string;
  priceMin?: number;
  priceMax?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [minLocal, setMinLocal] = useState<string>(priceMin?.toString() ?? '');
  const [maxLocal, setMaxLocal] = useState<string>(priceMax?.toString() ?? '');

  function push(next: URLSearchParams) {
    next.delete('page');
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  function onSortChange(value: string) {
    const p = new URLSearchParams(params.toString());
    if (value && value !== 'recientes') p.set('sort', value);
    else p.delete('sort');
    push(p);
  }

  function applyPrice(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams(params.toString());
    if (minLocal) p.set('min', minLocal);
    else p.delete('min');
    if (maxLocal) p.set('max', maxLocal);
    else p.delete('max');
    push(p);
  }

  function clearFilters() {
    const p = new URLSearchParams(params.toString());
    p.delete('min');
    p.delete('max');
    p.delete('sort');
    setMinLocal('');
    setMaxLocal('');
    push(p);
  }

  const hasPriceFilter = priceMin !== undefined || priceMax !== undefined;
  const hasAnyFilter = hasPriceFilter || (sort && sort !== 'recientes');

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-ink-600">
        {total} {total === 1 ? 'producto' : 'productos'}
        {q && <> para “<span className="text-ink-900">{q}</span>”</>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={applyPrice} className="flex items-center gap-1.5">
          <label htmlFor="price-min" className="sr-only">Precio mínimo</label>
          <input
            id="price-min"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min $"
            value={minLocal}
            onChange={(e) => setMinLocal(e.target.value)}
            className="w-20 rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
          <span className="text-ink-400">–</span>
          <label htmlFor="price-max" className="sr-only">Precio máximo</label>
          <input
            id="price-max"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max $"
            value={maxLocal}
            onChange={(e) => setMaxLocal(e.target.value)}
            className="w-20 rounded-md border border-ink-200 bg-surface px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
          <button
            type="submit"
            className="rounded-md bg-ink-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary"
          >
            Aplicar
          </button>
        </form>

        <label htmlFor="sort" className="sr-only">Ordenar por</label>
        <select
          id="sort"
          value={sort ?? 'recientes'}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-md border border-ink-200 bg-surface px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {hasAnyFilter && (
          <button
            onClick={clearFilters}
            className="text-xs text-primary hover:underline"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}

export function CatalogPagination({
  page,
  total,
  perPage,
}: {
  page: number;
  total: number;
  perPage: number;
}) {
  const params = useSearchParams();
  const pathname = usePathname();
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const next = new URLSearchParams(params.toString());
    if (p === 1) next.delete('page');
    else next.set('page', String(p));
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const pages = pageRange(page, totalPages);

  return (
    <nav aria-label="Paginación" className="mt-10 flex items-center justify-center gap-1">
      <PageLink href={hrefFor(Math.max(1, page - 1))} disabled={page === 1} label="Anterior">←</PageLink>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-2 text-ink-400" aria-hidden>…</span>
        ) : (
          <PageLink key={p} href={hrefFor(p)} active={p === page} label={`Página ${p}`}>
            {p}
          </PageLink>
        ),
      )}
      <PageLink href={hrefFor(Math.min(totalPages, page + 1))} disabled={page === totalPages} label="Siguiente">→</PageLink>
    </nav>
  );
}

function PageLink({
  href,
  children,
  active,
  disabled,
  label,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  label: string;
}) {
  if (disabled) {
    return (
      <span aria-label={label} className="grid h-9 min-w-9 place-items-center rounded-md px-2 text-sm text-ink-400">
        {children}
      </span>
    );
  }
  return (
    <a
      href={href}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={`grid h-9 min-w-9 place-items-center rounded-md px-2 text-sm transition-colors ${
        active ? 'bg-primary text-white' : 'hover:bg-ink-200/40 text-ink-900'
      }`}
    >
      {children}
    </a>
  );
}

function pageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | '…')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push('…');
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push('…');
  out.push(total);
  return out;
}
