export const TAX_RATE = 0.15;
export const TAX_LABEL = 'IVA 15%';

export const DELIVERY_FEE = 5;
export const PICKUP_ADDRESS = 'Retiro en oficina (Cuenca)';

export function formatMoney(value: number, currency = 'USD') {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function taxAmount(net: number) {
  return Math.round(net * TAX_RATE * 100) / 100;
}

export function withTax(net: number) {
  return Math.round(net * (1 + TAX_RATE) * 100) / 100;
}
