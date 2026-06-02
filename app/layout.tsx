import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { CartDrawer } from '@/components/CartDrawer';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { PromoBar } from '@/components/PromoBar';
import { getSettings } from '@/lib/supabase/queries';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  weight: 'variable',
  display: 'swap',
});

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dapahome.ec';

export const metadata: Metadata = {
  title: { default: 'Dapa Home — Catálogo', template: '%s · Dapa Home' },
  description:
    'Catálogo curado de iluminación, decoración y domótica para el hogar. Diseñado en Ecuador.',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Dapa Home',
    description: 'Diseño para el hogar que se siente personal.',
    locale: 'es_EC',
    type: 'website',
    url: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: '#F5F2EC',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dapa Home',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [] as string[],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: `+${settings.whatsapp.number}`,
      areaServed: 'EC',
      availableLanguage: ['es'],
    },
  };
  return (
    <html lang="es" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh flex flex-col bg-ink-100 text-ink-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-md focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
        >
          Saltar al contenido
        </a>
        <PromoBar promo={settings.promo_bar} />
        <SiteHeader />
        <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">{children}</main>
        <SiteFooter />
        <CartDrawer />
        <FloatingWhatsApp number={settings.whatsapp.number} greeting={settings.whatsapp.greeting} />
      </body>
    </html>
  );
}
