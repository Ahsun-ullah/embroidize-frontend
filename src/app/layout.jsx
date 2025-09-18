import ScrollToTopBottom from '@/components/Common/ScrollToTopBottom';
import { NProgressProvider } from '@/components/providers/NProgressProvider';
import ClientProviders from '@/lib/providers/ClientProviders';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import { Suspense } from 'react';
import 'remixicon/fonts/remixicon.css';
import './globals.css';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'default-no-store';

export const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata = {
  metadataBase: new URL('https://embroidize.com'),
  title: {
    default: 'Embroidize — Free Machine Embroidery Designs',
    template: '%s | Embroidize',
  },
  description:
    'Download high-quality machine embroidery designs in popular formats (PES, DST, JEF, EXP) — tested and free.',
  alternates: { canonical: 'https://embroidize.com' },
  openGraph: {
    type: 'website',
    siteName: 'Embroidize',
    url: 'https://embroidize.com',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='scroll-smooth'>
      <body
        className={`${plusJakarta.className} antialiased text-gray-900 bg-white`}
        suppressHydrationWarning
      >
        {/* Google Analytics */}
        <Script
          src='https://www.googletagmanager.com/gtag/js?id=G-BJ81WDRVP5'
          strategy='afterInteractive'
        />

        <Script
          id='gtag-init'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-BJ81WDRVP5', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

        <ClientProviders>
          <Suspense>
            <NProgressProvider>
              <main
                id='main-content'
                className='min-h-screen focus:outline-none'
              >
                {children}
              </main>
              <ScrollToTopBottom />
            </NProgressProvider>
          </Suspense>
        </ClientProviders>
      </body>
    </html>
  );
}
