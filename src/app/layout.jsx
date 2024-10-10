import { Inter } from "next/font/google";
import "remixicon/fonts/remixicon.css";
import AuthProviders from "./AuthProviders";
import "./globals.css";
import { Providers } from "./providers";
import StoreProvider from "./StoreProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>EmbroID</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AuthProviders>
          <StoreProvider>
            <Providers>
              <main className="min-h-screen">{children}</main>
            </Providers>
          </StoreProvider>
        </AuthProviders>
      </body>
    </html>
  );
}
