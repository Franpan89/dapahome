'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ProductCard } from '@/components/ProductCard';
import type { Category, Product, ProductImage } from '@/lib/supabase/types';

type CardProduct = Product & { images: ProductImage[]; category: Category | null };

export function ProductGrid({
  products,
  className,
  priorityCount = 0,
}: {
  products: CardProduct[];
  className?: string;
  priorityCount?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={className}>
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < priorityCount} />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <AnimatePresence mode="popLayout" initial={false}>
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductCard product={p} priority={i < priorityCount} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
