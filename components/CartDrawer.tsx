'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart, cartTotals, cartItemKey } from '@/lib/cart/store';
import { formatMoney, TAX_LABEL, taxAmount, withTax } from '@/lib/format';

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const items = useCart((s) => s.items);
  const close = useCart((s) => s.close);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);
  const { subtotal, count } = cartTotals(items);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            onClick={close}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Carrito"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-50 h-dvh w-full max-w-md bg-surface shadow-2xl flex flex-col"
          >
        <header className="relative overflow-hidden bg-ink-900 text-white p-6">
          <div className="relative flex items-center justify-between">
            <div>
              <div className="label text-white/80">Tu selección</div>
              <h2 className="font-display text-2xl tracking-tight">
                Carrito <span className="opacity-70">· {count}</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded-full p-2 text-white hover:bg-white/15"
              aria-label="Cerrar carrito"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-accent text-primary">
                <BagIcon className="h-7 w-7" />
              </div>
              <p className="font-display text-xl">Tu carrito está vacío</p>
              <p className="text-sm text-ink-600">
                Agrega productos y luego finaliza tu pedido por WhatsApp.
              </p>
              <Link href="/catalogo" onClick={close} className="btn-primary mt-3">
                Explorar catálogo
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-ink-200/60">
              <AnimatePresence initial={false}>
                {items.map((it) => {
                  const k = cartItemKey(it);
                  return (
                    <motion.li
                      key={k}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="flex gap-3 p-5 overflow-hidden"
                    >
                      <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded bg-ink-100">
                        {it.imageUrl && (
                          <Image
                            src={it.imageUrl}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/producto/${it.slug}`}
                          onClick={close}
                          className="font-display text-base leading-tight tracking-tight hover:text-primary line-clamp-2"
                        >
                          {it.name}
                        </Link>
                        {(it.variantLabel || it.colorLabel) && (
                          <div className="mt-0.5 text-xs text-ink-600">
                            {[it.variantLabel, it.colorLabel].filter(Boolean).join(' · ')}
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="inline-flex items-center rounded-md border border-ink-200">
                            <button
                              type="button"
                              onClick={() => setQty(k, it.quantity - 1)}
                              className="h-8 w-8 grid place-items-center text-ink-600 hover:text-primary"
                              aria-label="Reducir cantidad"
                            >−</button>
                            <span className="w-7 text-center text-sm tabular-nums">{it.quantity}</span>
                            <button
                              type="button"
                              onClick={() => setQty(k, it.quantity + 1)}
                              className="h-8 w-8 grid place-items-center text-ink-600 hover:text-primary"
                              aria-label="Aumentar cantidad"
                            >+</button>
                          </div>
                          <div className="font-mono text-sm tabular-nums">
                            {formatMoney(it.unitPrice * it.quantity, it.currency)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(k)}
                          className="mt-2 text-2xs text-danger hover:underline"
                        >
                          Quitar
                        </button>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-ink-200/60 p-6 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-ink-600">Subtotal</span>
                <span className="font-mono tabular-nums">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-ink-600">{TAX_LABEL}</span>
                <span className="font-mono tabular-nums">+ {formatMoney(taxAmount(subtotal))}</span>
              </div>
              <div className="flex items-baseline justify-between pt-2 border-t border-ink-200/60">
                <span className="label">Total con IVA</span>
                <span className="font-mono text-xl tabular-nums font-semibold">{formatMoney(withTax(subtotal))}</span>
              </div>
            </div>
            <p className="text-2xs text-ink-600">
              Elige retiro en oficina (sin costo) o envío (+ {formatMoney(5)}) en el siguiente paso.
            </p>
            <Link href="/carrito" onClick={close} className="btn-primary w-full">
              Finalizar por WhatsApp
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </footer>
        )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
function BagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
      <path d="M9 8a3 3 0 0 1 6 0" strokeLinecap="round" />
    </svg>
  );
}
function ArrowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
