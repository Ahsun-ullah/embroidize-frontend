// app/layout.jsx
import { AuthProvider } from '@/lib/providers/AuthProvider';
import StoreProvider from '@/lib/providers/StoreProvider';
import UiProvider from '@/lib/providers/UiProvider';
import { Inter } from 'next/font/google';
import 'remixicon/fonts/remixicon.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <head>
        <title>EmbroID</title>
        <link rel='icon' href='/favicon.ico' />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <StoreProvider>
          <AuthProvider
            protectedRoutes={['/admin', '/user/category-products']}
            exactProtectedRoutes={[]}
            loginPath='/auth/login'
            defaultRedirect='/'
          >
            <UiProvider>
              <main className='min-h-screen'>{children}</main>
            </UiProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
