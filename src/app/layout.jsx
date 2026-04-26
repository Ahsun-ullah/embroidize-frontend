import ScrollToTopBottom from '@/components/Common/ScrollToTopBottom';
import ChatIdentify from '@/components/Common/TawkIdentify';
import { NProgressProvider } from '@/components/providers/NProgressProvider';
import ClientProviders from '@/lib/providers/ClientProviders';
import { GoogleTagManager } from '@next/third-parties/google';
import Script from 'next/script';
import { Suspense } from 'react';
import 'remixicon/fonts/remixicon.css';
import './globals.css';

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
      <head>
        {/* Google Identity Services */}
        <Script
          src='https://accounts.google.com/gsi/client'
          strategy='afterInteractive'
        />

        {/* Apple Sign In */}
        <Script
          src='https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
          strategy='afterInteractive'
        />

        {/* Tawk.to — tracking only, widget hidden from Tawk.to dashboard */}
        <Script
          id='tawk-script'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: `
            var Tawk_API = Tawk_API || {};
            var Tawk_LoadStart = new Date();
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

      </head>

      <body
        className={` antialiased text-gray-900 bg-white`}
        suppressHydrationWarning
      >
        {/* Google Tag Manager */}
        <GoogleTagManager gtmId='GTM-MLM7Q32D' />

        {/* Google Analytics */}
        {/* <Script
          src='https://www.googletagmanager.com/gtag/js?id=G-BJ81WDRVP5'
          strategy='afterInteractive'
        /> */}

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

        {/* Crisp — live chat widget */}
        <Script
          id='crisp-script'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: `
            window.$crisp = [];
            window.CRISP_WEBSITE_ID = "9d1d964b-6b12-4029-8f3f-28266472b3ad";
            window.$crisp.push(["config", "position:reverse", false]);
            (function(){
              var d = document;
              var s = d.createElement("script");
              s.src = "https://client.crisp.chat/l.js";
              s.async = 1;
              d.getElementsByTagName("head")[0].appendChild(s);
            })();
          `,
          }}
        />

        <ClientProviders>
          <ChatIdentify />
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
