import ScrollToTopBottom from '@/components/Common/ScrollToTopBottom';
import { NProgressProvider } from '@/components/providers/NProgressProvider';
import ClientProviders from '@/lib/providers/ClientProviders';
import { GoogleTagManager } from '@next/third-parties/google';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import { Suspense } from 'react';
import 'remixicon/fonts/remixicon.css';
import './globals.css';

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
      {/* Tawk.to Scripts in head */}
      <Script
        id='tawk-script'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: `
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/68d4e2b7d256dc1950c32019/1j7lv3h9q';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();
          `,
        }}
      />

      <Script
        id='tawk-iframe-fix'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: `
            function fixTawkIframes() {
              document.querySelectorAll('iframe[title="chat widget"]').forEach((iframe) => {
                iframe.style.setProperty('right', '0px', 'important');
                iframe.style.setProperty('position', 'fixed', 'important');
              });
            }
            fixTawkIframes();
            setInterval(fixTawkIframes, 1000);
          `,
        }}
      />

      <body
        className={`${plusJakarta.className} antialiased text-gray-900 bg-white`}
        suppressHydrationWarning
      >
        {/* Google Tag Manager */}
        <GoogleTagManager gtmId='GTM-MLM7Q32D' />
        
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
