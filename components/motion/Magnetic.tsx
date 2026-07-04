'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function Magnetic({ children, strength = 0.28 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el || !window.matchMedia('(pointer: fine)').matches) return;
      const rect = el.getBoundingClientRect();
      setPos({
        x: (e.clientX - rect.left - rect.width / 2) * strength,
        y: (e.clientY - rect.top - rect.height / 2) * strength,
      });
    },
    [strength],
  );

  const reset = useCallback(() => setPos({ x: 0, y: 0 }), []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 220, damping: 16, mass: 0.4 }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}
