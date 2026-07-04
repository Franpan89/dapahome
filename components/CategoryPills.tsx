'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Category } from '@/lib/supabase/types';
import { cn } from '@/lib/cn';

export function CategoryPills({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const activeSlug = pathname?.startsWith('/catalogo/')
    ? pathname.replace('/catalogo/', '')
    : pathname === '/catalogo'
    ? 'todos'
    : null;

  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 -mx-5 px-5 sm:mx-0 sm:px-0">
        <Pill href="/catalogo" active={activeSlug === 'todos'}>✨ Todo</Pill>
        {categories.map((c) => (
          <Pill key={c.id} href={`/catalogo/${c.slug}`} active={activeSlug === c.slug}>
            {c.name}
          </Pill>
        ))}
      </div>
    </div>
  );
}

function Pill({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        'relative z-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
        active ? 'text-white' : 'border border-ink-200 bg-surface hover:border-ink-900 hover:bg-ink-900 hover:text-white',
      )}
    >
      {active && (
        <motion.span
          layoutId="pill-active-bg"
          className="absolute inset-0 -z-10 rounded-full bg-ink-900"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
      <span className="relative">{children}</span>
    </Link>
  );
}
