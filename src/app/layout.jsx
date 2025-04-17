import StoreProvider from '@/lib/providers/StoreProvider';
import UiProvider from '@/lib/providers/UiProvider';
import { Inter } from 'next/font/google';
import 'remixicon/fonts/remixicon.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
export const metadata = {
  title: 'Free Embroidery Machine Designs - Download High-Quality Patterns',
  description:
    'Download free embroidery machine designs with high-quality patterns for various fabric types. Get creative with our exclusive free collection of embroidery designs.',
  keywords: [
    'free embroidery machine designs',
    'free embroidery patterns',
    'download embroidery designs',
    'machine embroidery designs',
    'embroidery patterns',
    'free embroidery files',
  ],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Free Embroidery Machine Designs - Download High-Quality Patterns',
    description:
      'Download free embroidery machine designs with high-quality patterns for various fabric types.',
    url: 'https://embro-id.vercel.app/',
    siteName: 'Your Site Name',
    images: [
      {
        url: 'https://embro-id.vercel.app/home-banner.jpg',
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
      'Download free embroidery machine designs with high-quality patterns.',
    images: ['https://embro-id.vercel.app/home-banner.jpg'],
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
