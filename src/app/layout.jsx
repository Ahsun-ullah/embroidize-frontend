import StoreProvider from '@/lib/providers/StoreProvider';
import UiProvider from '@/lib/providers/UiProvider';
import { Inter } from 'next/font/google';
import 'remixicon/fonts/remixicon.css';
import './globals.css';
import { metadata } from './page';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <head>
        <meta
          name='p:domain_verify'
          content='a417c3036823eb607157878ef76fc2b0'
        />
        <title>{metadata.title}</title>
        <meta name='description' content={metadata.description} />
        <meta name='keywords' content={metadata.keywords.join(', ')} />
        <meta property='og:title' content={metadata.openGraph.title} />
        <meta
          property='og:description'
          content={metadata.openGraph.description}
        />
        <meta property='og:url' content={metadata.openGraph.url} />
        <meta property='og:site_name' content={metadata.openGraph.siteName} />
        <meta property='og:image' content={metadata.openGraph.images[0].url} />
        <meta property='og:type' content={metadata.openGraph.type} />
        <meta name='twitter:card' content={metadata.twitter.card} />
        <meta name='twitter:title' content={metadata.twitter.title} />
        <meta
          name='twitter:description'
          content={metadata.twitter.description}
        />
        <meta name='twitter:image' content={metadata.twitter.images[0]} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <StoreProvider>
          {/* <AuthProvider
            protectedRoutes={['/admin']}
            exactProtectedRoutes={[]}
            loginPath='/auth/login'
            defaultRedirect='/'
          > */}
          <UiProvider>
            <main className='min-h-screen'>{children}</main>
          </UiProvider>
          {/* </AuthProvider> */}
        </StoreProvider>
      </body>
    </html>
  );
}
