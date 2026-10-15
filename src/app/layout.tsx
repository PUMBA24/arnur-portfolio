import type { Metadata } from 'next';
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
  title: {
    default: `${site.name} — junior веб-разработчик`,
    template: `%s · ${site.name}`,
  },
  description:
    'Портфолио junior frontend-разработчика из Казахстана: учебные проекты, ориентиры по стоимости и простой способ обсудить сайт.',
  openGraph: {
    title: `${site.name} — junior веб-разработчик`,
    description: 'Учебные проекты, понятные цены и связь без лишних формальностей.',
    type: 'website',
    locale: 'ru_KZ',
    images: [{ url: '/promo-banner.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', images: ['/promo-banner.png'] },
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
