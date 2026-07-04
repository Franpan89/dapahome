'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

// Rutas donde navegar entre subpáginas (p. ej. categorías del catálogo) no debe
// disparar un fade de página completa — solo el contenido interno (grid de
// productos) debe animarse.
const GROUPED_PREFIXES = ['/catalogo'];

function transitionKey(pathname: string) {
  const grouped = GROUPED_PREFIXES.find((p) => pathname === p || pathname.startsWith(`${p}/`));
  return grouped ?? pathname;
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={transitionKey(pathname ?? '')}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
