import StoreProvider from '@/lib/providers/StoreProvider';
import UiProvider from '@/lib/providers/UiProvider';
import { Inter } from 'next/font/google';
import 'remixicon/fonts/remixicon.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'Free Machine Embroidery Designs - Embroidize',
  description:
    'Download free embroidery designs instantly – Browse unlimited machine embroidery Design in multiple categories and styles. All designs are tested and come in the most popular formats',
  keywords: [
    'free embroidery machine designs',
    'Embroidery design',
    'Machine embroidery designs',
    'machine embroidery file',
    'Machine embroidery patterns',
    'free embroidery files',
  ],
  openGraph: {
    title: 'Free Machine Embroidery Designs - Embroidize',
    description:
      'Download free embroidery designs instantly – Browse unlimited machine embroidery Design in multiple categories and styles. All designs are tested and come in the most popular formats',
    url: 'https://embroidize.com/',
    siteName: 'Embroid',
    images: [
      {
        url: 'https://embroidize.com/og-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Free Embroidery Machine Designs',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Embroidery Machine Designs',
    description:
      'Download free embroidery designs instantly – Browse unlimited machine embroidery Design in multiple categories and styles. All designs are tested and come in the most popular formats.',
    images: ['https://embroidize.com/og-banner.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
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
