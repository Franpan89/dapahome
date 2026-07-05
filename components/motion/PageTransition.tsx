'use client';

import { motion, useReducedMotion } from 'framer-motion';
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

  // Sin AnimatePresence/mode="wait": esa combinación desmonta la página
  // anterior y espera a que termine su animación de salida antes de montar
  // la nueva, lo que en producción podía dejar la pantalla en blanco de forma
  // permanente si esa espera se interrumpía. Aquí el contenido nuevo se monta
  // de inmediato (React ya lo entrega vía navegación) y solo se anima su
  // entrada — nunca hay un estado sin contenido.
  return (
    <motion.div
      key={transitionKey(pathname ?? '')}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
