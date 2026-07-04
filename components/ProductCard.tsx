'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { imageUrl } from '@/lib/supabase/image';
import type { Category, Product, ProductImage } from '@/lib/supabase/types';
import { formatMoney, TAX_LABEL, withTax } from '@/lib/format';
import { useCart } from '@/lib/cart/store';

type CardProduct = Product & { images: ProductImage[]; category: Category | null };

export function ProductCard({ product, priority = false }: { product: CardProduct; priority?: boolean }) {
  const primary = product.images.find((i) => i.is_primary) ?? product.images[0];
  const second = product.images.find((i) => i.id !== primary?.id) ?? primary;
  const add = useCart((s) => s.add);

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add({
      productId: product.id,
      variantId: null,
      slug: product.slug,
      name: product.name,
      variantLabel: null,
      colorLabel: null,
      unitPrice: product.base_price,
      currency: product.currency,
      imageUrl: primary ? imageUrl(primary.storage_path) : null,
    });
    toast.success(`${product.name} agregado al carrito`);
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
    <Link
      href={`/producto/${product.slug}`}
      className="group block"
      aria-label={`Ver ${product.name}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-ink-50">
        {primary && (
          <Image
            src={imageUrl(primary.storage_path)}
            alt={primary.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            priority={priority}
            className="object-cover transition-[transform,opacity] duration-700 ease-out group-hover:scale-105 group-hover:opacity-0"
          />
        )}
        {second && second.id !== primary?.id && (
          <Image
            src={imageUrl(second.storage_path)}
            alt=""
            aria-hidden
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
          />
        )}

        {product.featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider text-white">
            Top
          </span>
        )}

        <button
          type="button"
          onClick={quickAdd}
          aria-label={`Agregar ${product.name} al carrito`}
          className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-ink-900 text-white shadow-lg
                     translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                     transition-all duration-300 ease-out
                     hover:bg-secondary hover:scale-110 active:scale-95"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {product.category && (
            <div className="text-2xs uppercase tracking-wider text-ink-600">
              {product.category.name}
            </div>
          )}
          <h3 className="mt-0.5 font-display text-base font-medium leading-snug tracking-tight text-balance line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>
        <div className="flex-shrink-0 text-right tabular-nums">
          <div className="font-display text-base font-semibold leading-none">
            {formatMoney(product.base_price, product.currency)}
          </div>
          <div className="mt-1 text-2xs text-ink-600">
            + {TAX_LABEL} · {formatMoney(withTax(product.base_price), product.currency)}
          </div>
        </div>
      </div>
    </Link>
    </motion.div>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" {...props}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}
