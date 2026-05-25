import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { CartDrawer } from '@/components/CartDrawer';

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

export const metadata: Metadata = {
  title: { default: 'Dapa Home — Catálogo', template: '%s · Dapa Home' },
  description:
    'Catálogo curado de iluminación, decoración y domótica para el hogar. Diseñado en Ecuador.',
  metadataBase: new URL('https://dapahome.ec'),
  openGraph: {
    title: 'Dapa Home',
    description: 'Diseño para el hogar que se siente personal.',
    locale: 'es_EC',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#F5F2EC',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh flex flex-col bg-ink-100 text-ink-900">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CartDrawer />
      </body>
    </html>
  );
}
