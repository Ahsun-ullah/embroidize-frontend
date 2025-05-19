import StoreProvider from '@/lib/providers/StoreProvider';
import UiProvider from '@/lib/providers/UiProvider';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import 'remixicon/fonts/remixicon.css';
import './globals.css';
import { metadata } from './page';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <Head>
        {/* Google Analytics */}
        <script
          async
          src='https://www.googletagmanager.com/gtag/js?id=G-BJ81WDRVP5'
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BJ81WDRVP5');
          `,
          }}
        />

        {/* Domain Verification */}
        <meta
          name='p:domain_verify'
          content='a417c3036823eb607157878ef76fc2b0'
        />

        {/* SEO Meta Tags */}
        <title>Free Machine Embroidery Designs - Embroidize</title>

        {/* Open Graph */}
        <meta property='og:title' content={metadata.openGraph.title} />
        <meta
          property='og:description'
          content={metadata.openGraph.description}
        />
        <meta property='og:url' content={metadata.openGraph.url} />
        <meta property='og:site_name' content={metadata.openGraph.siteName} />
        <meta property='og:image' content={metadata.openGraph.images[0]?.url} />
        <meta property='og:type' content={metadata.openGraph.type} />

        {/* Twitter Cards */}
        <meta name='twitter:card' content={metadata.twitter.card} />
        <meta name='twitter:title' content={metadata.twitter.title} />
        <meta
          name='twitter:description'
          content={metadata.twitter.description}
        />
        <meta name='twitter:image' content={metadata.twitter.images[0]} />
      </Head>
      <body className={inter.className} suppressHydrationWarning>
        <StoreProvider>
          <UiProvider>
            <main className='min-h-screen'>{children}</main>
          </UiProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
