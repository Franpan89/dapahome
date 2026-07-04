'use client';

import dynamic from 'next/dynamic';

const CartDrawer = dynamic(
  () => import('@/components/CartDrawer').then((m) => ({ default: m.CartDrawer })),
  { ssr: false },
);

export function LazyCartDrawer() {
  return <CartDrawer />;
}
