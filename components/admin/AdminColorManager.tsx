'use client';

import { useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import type { ProductColor } from '@/lib/supabase/types';

export function AdminColorManager({
  productId,
  colors: initial,
}: {
  productId: string;
  colors: ProductColor[];
}) {
  const sb = createSupabaseBrowser();
  const [colors, setColors] = useState<ProductColor[]>([...initial].sort((a, b) => a.sort_order - b.sort_order));
  const [busy, setBusy] = useState(false);

  async function addColor() {
    setBusy(true);
    const { data } = await sb
      .from('product_colors')
      .insert({ product_id: productId, name: 'Nuevo color', hex: '#CCCCCC', sort_order: colors.length })
      .select('*')
      .single();
    if (data) setColors([...colors, data as ProductColor]);
    setBusy(false);
  }

  async function update(id: string, patch: Partial<ProductColor>) {
    setColors((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } as ProductColor : c)));
    await sb.from('product_colors').update(patch).eq('id', id);
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar color?')) return;
    await sb.from('product_colors').delete().eq('id', id);
    setColors((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-ink-100 text-2xs uppercase tracking-wider text-ink-600">
          <tr>
            <th className="text-left px-3 py-2 w-14">Color</th>
            <th className="text-left px-3 py-2">Nombre</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-200/60">
          {colors.map((c) => (
            <tr key={c.id}>
              <td className="px-3 py-2">
                <input
                  type="color"
                  defaultValue={c.hex ?? '#CCCCCC'}
                  onChange={(e) => update(c.id, { hex: e.target.value })}
                  className="h-9 w-9 rounded border border-ink-200 cursor-pointer"
                  aria-label="Color"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  defaultValue={c.name}
                  onBlur={(e) => update(c.id, { name: e.target.value })}
                  className="w-full px-2 py-1 rounded border border-ink-200"
                  placeholder="Ej: Terracota"
                />
              </td>
              <td className="px-3 py-2 text-right">
                <button onClick={() => remove(c.id)} className="text-2xs text-danger hover:underline">Eliminar</button>
              </td>
            </tr>
          ))}
          {colors.length === 0 && (
            <tr><td colSpan={3} className="px-3 py-6 text-center text-ink-600">Sin colores. Es opcional — el cliente solo verá esta opción si agregas al menos uno.</td></tr>
          )}
        </tbody>
      </table>
      <div className="p-3 border-t border-ink-200/60">
        <button onClick={addColor} disabled={busy} className="btn-outline">+ Agregar color</button>
      </div>
    </div>
  );
}
