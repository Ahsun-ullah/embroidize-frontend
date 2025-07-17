import ClientProviders from '@/lib/providers/ClientProviders';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import 'quill/dist/quill.core.css';
import 'remixicon/fonts/remixicon.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'Free Machine Embroidery Designs - Embroidize',
  description: 'Download free embroidery machine designs in multiple formats.',
  metadataBase: new URL('https://embroidize.com'),
  openGraph: {
    title: 'Free Machine Embroidery Designs - Embroidize',
    description: 'Explore and download premium free embroidery designs.',
    url: 'https://embroidize.com',
    siteName: 'Embroidize',
    images: [
      {
        url: 'https://embroidize.com/og-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Embroidize - Free Embroidery Designs',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Machine Embroidery Designs - Embroidize',
    description: 'Explore and download premium free embroidery designs.',
    images: ['https://embroidize.com/og-banner.jpg'],
  },
  icons: {
    icon: '/favicon.png',
  },
  verification: {
    google: 'hVDO2LwJX8GOqQ809KdHmfVZ96gxwrrSC8J80OhLD-k',
    other: {
      'p:domain_verify': 'a417c3036823eb607157878ef76fc2b0',
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='scroll-smooth'>
      <body
        className={`${inter.className} antialiased text-gray-900 bg-white`}
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
          <main id='main-content' className='min-h-screen focus:outline-none'>
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
