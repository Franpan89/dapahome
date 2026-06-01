'use client';

import { useState } from 'react';
import { bulkProductsAction } from '@/app/admin/actions';
import { formatMoney } from '@/lib/format';

interface Row {
  id: string;
  name: string;
  slug: string;
  status: string;
  base_price: number;
  currency: string;
  featured: boolean;
  category?: { name?: string } | null;
}

export function AdminProductsBulk({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<string | null>(null);

  const allChecked = rows.length > 0 && selected.size === rows.length;
  const someChecked = selected.size > 0 && !allChecked;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    if (allChecked) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.id)));
  }

  async function run(op: string) {
    if (selected.size === 0) return;
    const ok =
      op === 'archive'
        ? confirm(`¿Archivar ${selected.size} producto(s)? Dejarán de mostrarse en la tienda.`)
        : true;
    if (!ok) return;
    setPending(op);
    const fd = new FormData();
    fd.set('op', op);
    for (const id of selected) fd.append('id', id);
    await bulkProductsAction(fd);
    // bulkProductsAction redirects; this won't reach.
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="sticky top-2 z-10 mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-surface px-4 py-3 shadow-lg">
          <span className="text-sm font-medium">{selected.size} seleccionado(s)</span>
          <span className="flex-1" />
          <BulkBtn onClick={() => run('publish')} disabled={!!pending}>Publicar</BulkBtn>
          <BulkBtn onClick={() => run('unpublish')} disabled={!!pending}>Despublicar</BulkBtn>
          <BulkBtn onClick={() => run('feature')} disabled={!!pending}>Destacar</BulkBtn>
          <BulkBtn onClick={() => run('unfeature')} disabled={!!pending}>Quitar destacado</BulkBtn>
          <BulkBtn onClick={() => run('archive')} disabled={!!pending} danger>Archivar</BulkBtn>
          <button onClick={() => setSelected(new Set())} className="text-xs text-ink-600 hover:text-danger">
            Limpiar selección
          </button>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-100 text-2xs uppercase tracking-wider text-ink-600">
            <tr>
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => { if (el) el.indeterminate = someChecked; }}
                  onChange={toggleAll}
                  aria-label="Seleccionar todos"
                  className="h-4 w-4 accent-primary"
                />
              </th>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Categoría</th>
              <th className="text-right px-4 py-3">Precio</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/60">
            {rows.map((p) => {
              const checked = selected.has(p.id);
              return (
                <tr key={p.id} className={`hover:bg-accent/30 ${checked ? 'bg-primary/5' : ''}`}>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(p.id)}
                      aria-label={`Seleccionar ${p.name}`}
                      className="h-4 w-4 accent-primary"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.name} {p.featured && <span className="ml-1 text-secondary" aria-label="Destacado">◆</span>}</div>
                    <div className="text-2xs text-ink-600">/{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{p.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatMoney(p.base_price, p.currency)}</td>
                  <td className="px-4 py-3">
                    <span className={`chip ${p.status === 'active' ? 'bg-success/15 text-success' : 'bg-ink-200/60 text-ink-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a href={`/admin/productos/${p.id}`} className="text-primary text-sm hover:underline">Editar</a>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-ink-600">Sin resultados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function BulkBtn({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
        danger
          ? 'bg-danger/10 text-danger hover:bg-danger/20'
          : 'bg-ink-900 text-white hover:bg-primary'
      }`}
    >
      {children}
    </button>
  );
}
