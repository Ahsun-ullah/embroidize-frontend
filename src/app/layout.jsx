import StoreProvider from '@/lib/providers/StoreProvider';
import UiProvider from '@/lib/providers/UiProvider';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import 'remixicon/fonts/remixicon.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'Free Machine Embroidery Designs - Embroidize',
  description: 'Download free embroidery machine designs in multiple formats.',
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
  metadataBase: new URL('https://embroidize.com'),
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <head>
        {/* Domain Verification */}
        <meta
          name='p:domain_verify'
          content='a417c3036823eb607157878ef76fc2b0'
        />
        <meta name="google-site-verification" content="hVDO2LwJX8GOqQ809KdHmfVZ96gxwrrSC8J80OhLD-k" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
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
              gtag('config', 'G-BJ81WDRVP5');
            `,
          }}
        />

        <StoreProvider>
          <UiProvider>
            <main className='min-h-screen'>{children}</main>
          </UiProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
