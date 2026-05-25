'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Category } from '@/lib/supabase/types';

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
    <Link href={href} className={active ? 'pill-nav-active' : 'pill-nav'}>
      {children}
    </Link>
  );
}
