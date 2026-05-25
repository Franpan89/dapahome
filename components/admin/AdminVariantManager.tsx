'use client';

import { useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import type { ProductVariant } from '@/lib/supabase/types';

export function AdminVariantManager({
  productId,
  variants: initial,
}: {
  productId: string;
  variants: ProductVariant[];
}) {
  const sb = createSupabaseBrowser();
  const [variants, setVariants] = useState<ProductVariant[]>([...initial].sort((a, b) => a.sort_order - b.sort_order));
  const [busy, setBusy] = useState(false);

  async function addVariant() {
    setBusy(true);
    const { data } = await sb
      .from('product_variants')
      .insert({ product_id: productId, name: 'Nueva variante', options: {}, sort_order: variants.length })
      .select('*')
      .single();
    if (data) setVariants([...variants, data as ProductVariant]);
    setBusy(false);
  }

  async function update(id: string, patch: Partial<ProductVariant>) {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } as ProductVariant : v)));
    await sb.from('product_variants').update(patch).eq('id', id);
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar variante?')) return;
    await sb.from('product_variants').delete().eq('id', id);
    setVariants((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-ink-100 text-2xs uppercase tracking-wider text-ink-600">
          <tr>
            <th className="text-left px-3 py-2">Nombre</th>
            <th className="text-left px-3 py-2">SKU</th>
            <th className="text-right px-3 py-2">Precio (override)</th>
            <th className="text-right px-3 py-2">Stock</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-200/60">
          {variants.map((v) => (
            <tr key={v.id}>
              <td className="px-3 py-2">
                <input defaultValue={v.name} onBlur={(e) => update(v.id, { name: e.target.value })} className="w-full px-2 py-1 rounded border border-ink-200" />
              </td>
              <td className="px-3 py-2">
                <input defaultValue={v.sku ?? ''} onBlur={(e) => update(v.id, { sku: e.target.value })} className="w-full px-2 py-1 rounded border border-ink-200 font-mono text-xs" />
              </td>
              <td className="px-3 py-2 text-right">
                <input type="number" step="0.01" defaultValue={v.price_override ?? ''} onBlur={(e) => update(v.id, { price_override: e.target.value ? Number(e.target.value) : null })} className="w-24 px-2 py-1 rounded border border-ink-200 text-right tabular-nums" />
              </td>
              <td className="px-3 py-2 text-right">
                <input type="number" defaultValue={v.stock ?? ''} onBlur={(e) => update(v.id, { stock: e.target.value ? Number(e.target.value) : null })} className="w-20 px-2 py-1 rounded border border-ink-200 text-right tabular-nums" />
              </td>
              <td className="px-3 py-2 text-right">
                <button onClick={() => remove(v.id)} className="text-2xs text-danger hover:underline">Eliminar</button>
              </td>
            </tr>
          ))}
          {variants.length === 0 && (
            <tr><td colSpan={5} className="px-3 py-6 text-center text-ink-600">Sin variantes. Es opcional.</td></tr>
          )}
        </tbody>
      </table>
      <div className="p-3 border-t border-ink-200/60">
        <button onClick={addVariant} disabled={busy} className="btn-outline">+ Agregar variante</button>
      </div>
    </div>
  );
}
