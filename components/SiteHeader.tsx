'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCart, cartTotals } from '@/lib/cart/store';

export function SiteHeader({ number, greeting }: { number: string; greeting?: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = useCart((s) => s.items);
  const toggle = useCart((s) => s.toggle);
  const { count } = cartTotals(items);
  const whatsappHref = `https://wa.me/${number}${greeting ? `?text=${encodeURIComponent(greeting)}` : ''}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-ink-100/90 backdrop-blur border-b border-ink-200/60' : 'bg-transparent'
      }`}
    >
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center" aria-label="Inicio Dapa Home">
          <Image
            src="/logo.png"
            alt="Dapa Home"
            width={160}
            height={160}
            priority
            className="h-14 w-auto md:h-16"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
          <NavLink href="/">Inicio</NavLink>
          <NavLink href="/catalogo">Productos</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/sobre-nosotros#encuentranos">Encuéntranos</NavLink>
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/catalogo"
            className="hidden sm:inline-flex items-center justify-center rounded-full p-2.5 text-ink-900 hover:bg-ink-200/40"
            aria-label="Buscar"
          >
            <SearchIcon className="h-5 w-5" />
          </Link>

          <button
            type="button"
            onClick={toggle}
            className="relative inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-medium hover:bg-ink-200/40 min-h-[44px]"
            aria-label={`Abrir carrito, ${count} ${count === 1 ? 'producto' : 'productos'}`}
          >
            <BagIcon className="h-5 w-5" />
            {count > 0 && (
              <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-secondary px-1.5 text-2xs font-semibold text-white tabular-nums">
                {count}
              </span>
            )}
          </button>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener"
            className="btn hidden md:inline-flex bg-success text-white hover:brightness-105 active:scale-[0.98]"
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp
          </a>

          <button
            type="button"
            className="md:hidden inline-flex p-2.5 rounded-full hover:bg-ink-200/40"
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-ink-200/60 bg-surface" aria-label="Menú móvil">
          <ul className="container-page py-2 grid gap-1">
            {[
              ['/', 'Inicio'],
              ['/catalogo', 'Productos'],
              ['/blog', 'Blog'],
              ['/sobre-nosotros#encuentranos', 'Encuéntranos'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded-md px-3 py-3 text-sm hover:bg-ink-100"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener"
                className="mt-1 flex items-center justify-center gap-2 rounded-md bg-success px-3 py-3 text-sm font-medium text-white"
                onClick={() => setOpen(false)}
              >
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3.5 py-2 text-sm text-ink-700 hover:text-ink-900 hover:bg-ink-200/40 transition-colors"
    >
      {children}
    </Link>
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
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
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
