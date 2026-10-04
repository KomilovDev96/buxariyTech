import type { Metadata } from 'next';
import Link from 'next/link';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import './globals.css';
import { getDictionary, getLocale } from '@/lib/i18n';
import { Navigation } from '@/components/navigation';
import { siteUrl } from '@/lib/metadata';
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BUHARIY TECH — Biznes uchun raqamli yechimlar',
    template: '%s | BUHARIY TECH',
  },
  description:
    'BUHARIY TECH — biznes avtomatlashtirish, Telegram botlar, web-saytlar, AI yechimlar va maxsus raqamli tizimlar yaratadi.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    siteName: 'BUHARIY TECH',
    type: 'website',
    images: [{ url: '/images/bukhara.webp', alt: 'Buxoro shahri' }],
  },
  twitter: { card: 'summary_large_image', images: ['/images/bukhara.webp'] },
};
export default async function Layout({ children }: { children: React.ReactNode }) {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'BUHARIY TECH',
              url: siteUrl,
              slogan: 'Qadriyatlardan kelajakka',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Buxoro',
                addressCountry: 'UZ',
              },
            }).replace(/</g, '\\u003c'),
          }}
        />
        <a className="skip-link" href="#main">
          Asosiy tarkibga o‘tish
        </a>
        <Navigation t={t} locale={locale} />
        <main id="main">{children}</main>
        <footer className="footer container">
          <div>
            <Link href="/" className="wordmark">
              BUHARIY<span>TECH</span>
            </Link>
            <p>{t.footer}</p>
          </div>
          <div className="footer-links">
            <Link href="/services">{t.nav[0]}</Link>
            <Link href="/portfolio">{t.nav[1]}</Link>
            <Link href="/contact">{t.nav[3]}</Link>
            <Link href="/privacy">{t.privacy}</Link>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} BUHARIY TECH</span>
            <span>{t.tagline}.</span>
            <span>Buxoro, O‘zbekiston</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
