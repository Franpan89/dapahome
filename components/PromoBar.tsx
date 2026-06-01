import Link from 'next/link';
import type { PromoBar as PromoBarType } from '@/lib/supabase/types';

export function PromoBar({ promo }: { promo: PromoBarType }) {
  if (!promo?.enabled || !promo.text) return null;

  const content = (
    <div className="container-page py-2 text-center text-2xs sm:text-xs font-medium tracking-wide">
      {promo.text}
      {promo.link && <span aria-hidden className="ml-1.5">→</span>}
    </div>
  );

  return (
    <div className="bg-ink-900 text-white" role="region" aria-label="Anuncio">
      {promo.link ? (
        <Link href={promo.link} className="block hover:bg-primary transition-colors">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
