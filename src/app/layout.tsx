import type { Metadata } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { Extras, Footer, Header } from '@/components/Shell';
import { Providers } from '@/components/Providers';
import { site } from '@/data/site';
import './design.css';
import './home.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://arnurmedetuly777-portfolio.pages.dev';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: { icon: '/favicon.svg' },
  alternates: { canonical: siteUrl },
  title: {
    default: `${site.name} — junior веб-разработчик`,
    template: `%s · ${site.name}`,
  },
  description:
    'Портфолио junior frontend-разработчика из Казахстана: учебные проекты, ориентиры по стоимости и простой способ обсудить сайт.',
  openGraph: {
    url: siteUrl,
    title: `${site.name} — junior веб-разработчик`,
    description: 'Учебные проекты, понятные цены и связь без лишних формальностей.',
    type: 'website',
    locale: 'ru_KZ',
    images: [
      {
        url: '/promo-banner.png',
        width: 1200,
        height: 630,
        alt: 'Портфолио Арнура — сайты для малого бизнеса',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — junior веб-разработчик`,
    description: 'Учебные проекты, ориентиры по стоимости и связь без лишних формальностей.',
    images: [{ url: '/promo-banner.png', alt: 'Портфолио Арнура — сайты для малого бизнеса' }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: site.role,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Алматы',
      addressCountry: 'KZ',
    },
  };

  return (
    <html lang="ru" suppressHydrationWarning>
      <body id="top">
        <Script id="home-scroll-restoration" strategy="beforeInteractive">
          {`if (window.location.pathname === '/' && !window.location.hash) window.history.scrollRestoration = 'manual';`}
        </Script>
        <Providers>
          <a className="skip-link" href="#main-content">
            Перейти к содержимому
          </a>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
          <Extras />
        </Providers>
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
          type="application/ld+json"
        />
      </body>
    </html>
  );
}
