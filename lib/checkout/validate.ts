import { effectiveBilling, type CustomerData } from '@/lib/cart/store';

export type CustomerErrors = Partial<Record<keyof CustomerData, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const digits = (v: string) => v.replace(/\D/g, '');

export function validateCustomer(c: CustomerData): CustomerErrors {
  const e: CustomerErrors = {};
  if (c.firstName.trim().length < 2) e.firstName = 'Escribe tus nombres.';
  if (c.lastName.trim().length < 2) e.lastName = 'Escribe tus apellidos.';
  if (digits(c.phone).length < 9) e.phone = 'Escribe un celular válido.';
  if (!EMAIL_RE.test(c.email.trim())) e.email = 'Escribe un correo válido.';
  if (c.address.trim().length < 5) e.address = 'Escribe tu dirección de envío.';
  if (c.city.trim().length < 2) e.city = 'Cuéntanos tu ciudad.';

  const docLen = digits(c.billingDocumentId).length;
  if (docLen !== 10 && docLen !== 13) e.billingDocumentId = 'La cédula tiene 10 dígitos y el RUC 13.';

  if (!c.billingSame) {
    if (c.billingFirstName.trim().length < 2) e.billingFirstName = 'Escribe los nombres.';
    if (c.billingLastName.trim().length < 2) e.billingLastName = 'Escribe los apellidos.';
    if (digits(c.billingPhone).length < 9) e.billingPhone = 'Escribe un celular válido.';
    if (!EMAIL_RE.test(c.billingEmail.trim())) e.billingEmail = 'Escribe un correo válido.';
    if (c.billingAddress.trim().length < 5) e.billingAddress = 'Escribe la dirección de facturación.';
  }
  return e;
}

/** Celular ecuatoriano a formato internacional (+593…) como exige PayPhone. */
export function toIntlPhone(raw: string) {
  const d = digits(raw);
  if (d.startsWith('593')) return `+${d}`;
  return `+593${d.replace(/^0/, '')}`;
}

export function billingForPayphone(c: CustomerData) {
  const b = effectiveBilling(c);
  const doc = digits(b.documentId);
  return {
    phoneNumber: toIntlPhone(b.phone),
    email: b.email.trim(),
    documentId: doc,
    identificationType: doc.length === 13 ? 2 : 1,
  };
}
