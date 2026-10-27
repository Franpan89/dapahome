'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  variantLabel: string | null;
  colorLabel: string | null;
  unitPrice: number;
  currency: string;
  imageUrl: string | null;
  quantity: number;
}

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

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  customer: CustomerData;
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setCustomer: (patch: Partial<CustomerData>) => void;
}

const keyOf = (it: { productId: string; variantId: string | null; colorLabel?: string | null }) =>
  `${it.productId}::${it.variantId ?? '-'}::${it.colorLabel ?? '-'}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      customer: EMPTY_CUSTOMER,
      setCustomer: (patch) => set((s) => ({ customer: { ...s.customer, ...patch } })),
      add: (item, qty = 1) =>
        set((s) => {
          const k = keyOf(item);
          const idx = s.items.findIndex((i) => keyOf(i) === k);
          if (idx >= 0) {
            const next = [...s.items];
            next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
            return { items: next, isOpen: true };
          }
          return { items: [...s.items, { ...item, quantity: qty }], isOpen: true };
        }),
      remove: (key) =>
        set((s) => ({ items: s.items.filter((i) => keyOf(i) !== key) })),
      setQty: (key, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (keyOf(i) === key ? { ...i, quantity: Math.max(1, qty) } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name: 'dapa-cart-v2',
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<CartState>;
        return { ...current, ...p, customer: { ...EMPTY_CUSTOMER, ...(p.customer ?? {}) } };
      },
    },
  ),
);

export const cartItemKey = keyOf;

export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const count = items.reduce((acc, i) => acc + i.quantity, 0);
  return { subtotal, count };
}
