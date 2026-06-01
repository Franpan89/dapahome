'use client';

import { usePathname } from 'next/navigation';

export function FloatingWhatsApp({ number, greeting }: { number: string; greeting?: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  if (pathname?.startsWith('/producto/')) return null; // mobile bar already covers producto

  const href = `https://wa.me/${number}${greeting ? `?text=${encodeURIComponent(greeting)}` : ''}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="Hablar por WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-success text-white shadow-lg ring-1 ring-black/5 hover:scale-105 active:scale-95 transition-transform"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.93.55 3.81 1.6 5.45L2 22l4.79-1.7a9.86 9.86 0 0 0 5.25 1.5h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.13-2.9-7C17.18 3.03 14.69 2 12.04 2Z" />
      </svg>
      <span className="sr-only">Hablar por WhatsApp</span>
    </a>
  );
}
