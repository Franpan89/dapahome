export function formatMoney(value: number, currency = 'USD') {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}
