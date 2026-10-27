import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import { Toaster } from 'sonner';
import Script from 'next/script';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { LazyCartDrawer } from '@/components/LazyCartDrawer';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { PromoBar } from '@/components/PromoBar';
import { PageTransition } from '@/components/motion/PageTransition';
import { getSettings } from '@/lib/supabase/queries';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: 'variable',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dapahome.ec';
const META_PIXEL_ID = '1290302039232952';

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
    <html lang="es" className={montserrat.variable}>
      <body className="min-h-dvh flex flex-col bg-ink-100 text-ink-900">
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            alt=""
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
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
        <SiteHeader number={settings.whatsapp.number} greeting={settings.whatsapp.greeting} />
        <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter />
        <LazyCartDrawer />
        <FloatingWhatsApp number={settings.whatsapp.number} greeting={settings.whatsapp.greeting} />
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              fontFamily: 'var(--font-sans)',
              borderRadius: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
