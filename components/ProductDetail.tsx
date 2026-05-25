'use client';

import Image from 'next/image';
import NextLink from 'next/link';
import { useMemo, useState } from 'react';
import { imageUrl } from '@/lib/supabase/image';
import { formatMoney } from '@/lib/format';
import { useCart } from '@/lib/cart/store';
import type { ProductWithRelations, ProductVariant } from '@/lib/supabase/types';
import { cn } from '@/lib/cn';
import { buildWhatsAppMessage, whatsappHref } from '@/lib/whatsapp/buildMessage';

export function ProductDetail({ product }: { product: ProductWithRelations }) {
  const [activeImg, setActiveImg] = useState(0);
  const [variant, setVariant] = useState<ProductVariant | null>(product.variants[0] ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  const price = variant?.price_override ?? product.base_price;
  const mainImage = product.images[activeImg] ?? product.images[0];

  const onAdd = () => {
    add(
      {
        productId: product.id,
        variantId: variant?.id ?? null,
        slug: product.slug,
        name: product.name,
        variantLabel: variant?.name ?? null,
        unitPrice: price,
        currency: product.currency,
        imageUrl: product.images[0] ? imageUrl(product.images[0].storage_path) : null,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const directWhatsApp = useMemo(() => {
    const msg = buildWhatsAppMessage({
      items: [
        {
          productId: product.id,
          variantId: variant?.id ?? null,
          slug: product.slug,
          name: product.name,
          variantLabel: variant?.name ?? null,
          unitPrice: price,
          currency: product.currency,
          imageUrl: null,
          quantity: qty,
        },
      ],
      data: { name: '', city: '', notes: '' },
      template: {
        intro: 'Hola Dapa Home 👋, me interesa este producto:',
        outro: '¿Me podrían dar más información? ¡Gracias!',
      },
    });
    return whatsappHref(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '593998001894', msg);
  }, [product, variant, qty, price]);

  return (
    <article className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 items-start">
      {/* Galería */}
      <div className="grid gap-3 lg:grid-cols-[88px_1fr]">
        <div className="order-2 lg:order-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible scrollbar-hide">
          {product.images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveImg(i)}
              className={cn(
                'relative h-20 w-20 lg:h-22 lg:w-22 flex-shrink-0 overflow-hidden rounded-xl transition-all',
                i === activeImg ? 'ring-2 ring-ink-900' : 'ring-1 ring-ink-200/60 hover:ring-ink-900/40',
              )}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <Image
                src={imageUrl(img.storage_path)}
                alt=""
                fill
                sizes="88px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
        <div className="order-1 lg:order-2 relative aspect-square overflow-hidden rounded-3xl bg-ink-50">
          {mainImage && (
            <Image
              key={mainImage.id}
              src={imageUrl(mainImage.storage_path)}
              alt={mainImage.alt ?? product.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="object-cover animate-rise"
            />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="lg:sticky lg:top-24 space-y-6">
        {product.category && (
          <NextLink
            href={`/catalogo/${product.category.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-600 hover:text-primary"
          >
            <span className="h-1 w-1 rounded-full bg-secondary" />
            {product.category.name}
          </NextLink>
        )}
        <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight text-balance">
          {product.name}
        </h1>
        <div className="font-display text-3xl font-semibold tabular-nums">
          {formatMoney(price, product.currency)}
        </div>

        {product.description && (
          <p className="text-ink-600 leading-relaxed text-pretty whitespace-pre-line">
            {product.description}
          </p>
        )}

        {product.variants.length > 0 && (
          <fieldset>
            <legend className="label mb-3">Variante</legend>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariant(v)}
                  className={cn(
                    'rounded-full px-5 py-2.5 text-sm font-medium transition-all min-h-[44px]',
                    variant?.id === v.id
                      ? 'bg-ink-900 text-white'
                      : 'bg-ink-50 text-ink-900 hover:bg-ink-200/60',
                  )}
                  aria-pressed={variant?.id === v.id}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-full bg-ink-50 p-1">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="h-10 w-10 grid place-items-center rounded-full hover:bg-surface text-ink-700"
              aria-label="Reducir cantidad"
            >−</button>
            <span className="w-10 text-center text-sm font-medium tabular-nums" aria-live="polite">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="h-10 w-10 grid place-items-center rounded-full hover:bg-surface text-ink-700"
              aria-label="Aumentar cantidad"
            >+</button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={onAdd} className="btn-dark flex-1">
            {added ? '✓ Agregado' : 'Agregar al carrito'}
          </button>
          <a href={directWhatsApp} target="_blank" rel="noopener" className="btn-outline flex-1">
            <WhatsAppIcon className="h-4 w-4 text-success" /> Pedir por WhatsApp
          </a>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-ink-200/60 text-sm text-ink-600">
          <li className="flex gap-2.5"><CheckIcon className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /> Envíos a nivel nacional.</li>
          <li className="flex gap-2.5"><CheckIcon className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /> Asesoría por WhatsApp.</li>
          <li className="flex gap-2.5"><CheckIcon className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /> Garantía 6 meses.</li>
          <li className="flex gap-2.5"><CheckIcon className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /> Cambios sin complicaciones.</li>
        </ul>
      </div>
    </article>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" {...props}>
      <path d="m5 12 5 5 10-11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.93.55 3.81 1.6 5.45L2 22l4.79-1.7a9.86 9.86 0 0 0 5.25 1.5h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.13-2.9-7C17.18 3.03 14.69 2 12.04 2Z" />
    </svg>
  );
}
