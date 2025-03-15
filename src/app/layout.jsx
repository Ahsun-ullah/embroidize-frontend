import { Inter } from "next/font/google";
import UiProvider from "../lib/providers/UiProvider";
import "remixicon/fonts/remixicon.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <title>EmbroID</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        {/* <StoreProvider> */}
        <UiProvider>
          <main className="min-h-screen">{children}</main>
        </UiProvider>
        {/* </StoreProvider> */}
      </body>
    </html>
  );
}
