import type { CartItem } from '@/lib/cart/store';

export interface CheckoutData {
  name: string;
  city: string;
  notes: string;
}

export interface BuildMessageOpts {
  items: CartItem[];
  data: CheckoutData;
  template: { intro: string; outro: string };
  currency?: string;
}

const fmt = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('es-EC', { style: 'currency', currency }).format(n);

export function buildWhatsAppMessage({ items, data, template, currency = 'USD' }: BuildMessageOpts) {
  const lines: string[] = [];
  lines.push(template.intro);
  lines.push('');
  for (const it of items) {
    const variant = it.variantLabel ? ` (${it.variantLabel})` : '';
    lines.push(`• ${it.name}${variant} x${it.quantity} — ${fmt(it.unitPrice, it.currency)} c/u`);
  }
  const subtotal = items.reduce((a, i) => a + i.unitPrice * i.quantity, 0);
  lines.push('');
  lines.push(`Subtotal estimado: ${fmt(subtotal, currency)}`);
  lines.push('');
  lines.push('Mis datos:');
  if (data.name) lines.push(`• Nombre: ${data.name}`);
  if (data.city) lines.push(`• Ciudad: ${data.city}`);
  if (data.notes) lines.push(`• Notas: ${data.notes}`);
  lines.push('');
  lines.push(template.outro);
  return lines.join('\n');
}

export function whatsappHref(number: string, message: string) {
  const clean = number.replace(/[^\d]/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
