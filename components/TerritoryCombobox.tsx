'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface TerritoryOption {
  territoryBaseId: string;
  label: string;
}

let cache: TerritoryOption[] | null = null;
let cachePromise: Promise<TerritoryOption[]> | null = null;

function loadTerritories(): Promise<TerritoryOption[]> {
  if (cache) return Promise.resolve(cache);
  if (!cachePromise) {
    cachePromise = fetch('/api/territories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: TerritoryOption[]) => {
        cache = data;
        return data;
      })
      .catch(() => []);
  }
  return cachePromise;
}

export function TerritoryCombobox({
  id,
  label,
  value,
  onSelect,
  error,
  onBlur,
}: {
  id: string;
  label: string;
  value: string;
  onSelect: (territoryBaseId: string, label: string) => void;
  error?: string;
  onBlur?: () => void;
}) {
  const [options, setOptions] = useState<TerritoryOption[]>([]);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);
  useEffect(() => {
    loadTerritories().then(setOptions);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 30);
  }, [options, query]);

  return (
    <div ref={boxRef} className="relative">
      <label htmlFor={id} className="label">
        {label} <span className="text-danger">*</span>
      </label>
      <input
        id={id}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => onBlur?.(), 150);
        }}
        autoComplete="off"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`input mt-1.5 ${error ? 'border-danger focus:border-danger focus:ring-danger/15' : ''}`}
        placeholder="Escribe tu ciudad o parroquia…"
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-ink-200 bg-surface shadow-lg">
          {matches.map((o) => (
            <li key={o.territoryBaseId}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(o.territoryBaseId, o.label);
                  setQuery(o.label);
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-2xs text-danger">{error}</p>
      )}
    </div>
  );
}
