import localFont from 'next/font/local';

// Fonts for the subscription landing pages, self-hosted from this folder.
//
// These used to come from next/font/google, which downloads them from Google
// at BUILD time. When Google answered the build server with an unexpected
// response, `next build` crashed inside next/font ("Cannot read properties of
// null (reading '1')") and the deploy failed. Committed files make the build
// independent of Google. Latin subset only, as before; all are SIL OFL.
// Inter and Caveat are variable fonts, so one file covers every weight.

export const poppins = localFont({
  src: [
    { path: './Poppins-latin-500.woff2', weight: '500', style: 'normal' },
    { path: './Poppins-latin-600.woff2', weight: '600', style: 'normal' },
    { path: './Poppins-latin-700.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-poppins',
});

export const inter = localFont({
  src: './Inter-latin-var.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-inter',
});

export const caveat = localFont({
  src: './Caveat-latin-var.woff2',
  weight: '400 700',
  display: 'swap',
  variable: '--font-caveat',
});
