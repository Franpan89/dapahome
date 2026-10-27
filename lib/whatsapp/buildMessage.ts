import { effectiveBilling, type CartItem, type CustomerData, type DeliveryMethod } from '@/lib/cart/store';
import { TAX_LABEL, taxAmount, withTax, DELIVERY_FEE, PICKUP_ADDRESS } from '@/lib/format';

export interface BuildMessageOpts {
  items: CartItem[];
  data: CustomerData;
  template: { intro: string; outro: string };
  currency?: string;
}

const fmt = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('es-EC', { style: 'currency', currency }).format(n);

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dapahome.ec').replace(/\/$/, '');

export function buildWhatsAppMessage({ items, data, template, currency = 'USD' }: BuildMessageOpts) {
  const lines: string[] = [];
  lines.push(template.intro);
  lines.push('');
  for (const it of items) {
    const attrs = [it.variantLabel, it.colorLabel].filter(Boolean).join(', ');
    const suffix = attrs ? ` (${attrs})` : '';
    lines.push(`• ${it.name}${suffix} x${it.quantity} — ${fmt(it.unitPrice, it.currency)} c/u`);
    lines.push(`  ${SITE}/producto/${it.slug}`);
  }
  const subtotal = items.reduce((a, i) => a + i.unitPrice * i.quantity, 0);
  const delivery: DeliveryMethod = data.delivery ?? 'pickup';
  const shippingFee = delivery === 'delivery' ? DELIVERY_FEE : 0;
  const total = withTax(subtotal) + shippingFee;
  lines.push('');
  lines.push(`Subtotal: ${fmt(subtotal, currency)}`);
  lines.push(`${TAX_LABEL}: ${fmt(taxAmount(subtotal), currency)}`);
  lines.push(
    delivery === 'delivery' ? `Envío a nivel nacional: ${fmt(shippingFee, currency)}` : 'Retiro en oficina: gratis',
  );
  lines.push(`Total a pagar: ${fmt(total, currency)}`);
  lines.push('');
  if (data.firstName) {
    lines.push('Datos de envío:');
    lines.push(`• Nombre: ${data.firstName} ${data.lastName}`.trim());
    if (data.phone) lines.push(`• Celular: ${data.phone}`);
    if (data.email) lines.push(`• Correo: ${data.email}`);
    if (data.address) lines.push(`• Dirección: ${data.address}`);
    if (data.city) lines.push(`• Ciudad: ${data.city}`);
    lines.push(
      delivery === 'delivery'
        ? '• Entrega: Envío a domicilio'
        : `• Entrega: ${PICKUP_ADDRESS}`,
    );
    if (data.notes) lines.push(`• Notas: ${data.notes}`);
    const b = effectiveBilling(data);
    lines.push('');
    lines.push('Datos de facturación:');
    lines.push(`• Cédula/RUC: ${b.documentId}`);
    if (data.billingSame) {
      lines.push('• Mismos datos del envío');
    } else {
      lines.push(`• Nombre: ${b.firstName} ${b.lastName}`.trim());
      lines.push(`• Celular: ${b.phone}`);
      lines.push(`• Correo: ${b.email}`);
      lines.push(`• Dirección: ${b.address}`);
    }
  }
  lines.push('');
  lines.push(template.outro);
  return lines.join('\n');
}

export function whatsappHref(number: string, message: string) {
  const clean = number.replace(/[^\d]/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
