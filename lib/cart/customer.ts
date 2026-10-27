export type DeliveryMethod = 'pickup' | 'delivery';

export interface CustomerData {
  // Datos de envío
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  delivery: DeliveryMethod;
  // Datos de facturación
  billingSame: boolean;
  billingDocumentId: string;
  billingFirstName: string;
  billingLastName: string;
  billingPhone: string;
  billingEmail: string;
  billingAddress: string;
}

export const EMPTY_CUSTOMER: CustomerData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  notes: '',
  delivery: 'pickup',
  billingSame: true,
  billingDocumentId: '',
  billingFirstName: '',
  billingLastName: '',
  billingPhone: '',
  billingEmail: '',
  billingAddress: '',
};

/** Datos de facturación efectivos: si "igual al envío" está activo, se copian del envío. */
export function effectiveBilling(c: CustomerData) {
  if (!c.billingSame) {
    return {
      documentId: c.billingDocumentId,
      firstName: c.billingFirstName,
      lastName: c.billingLastName,
      phone: c.billingPhone,
      email: c.billingEmail,
      address: c.billingAddress,
    };
  }
  return {
    documentId: c.billingDocumentId,
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    email: c.email,
    address: c.address,
  };
}
