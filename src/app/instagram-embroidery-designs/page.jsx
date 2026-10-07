import { getLinkInBioPage } from '@/lib/apis/public/linkInBio';
import LinkInBioGrid from './LinkInBioGrid';
import Image from 'next/image';
import Link from 'next/link';

// embroidize.com/instagram-embroidery-designs: the URL in the Instagram bio
// (the old /links redirects here, see next.config.js). A tap on a tile goes
// to that design's page. Every link carries UTM tags so visits and sales from
// Instagram show up as their own source in Google Analytics.
const UTM = 'utm_source=instagram&utm_medium=social&utm_campaign=link_in_bio';

export const revalidate = 60;

export const metadata = {
  title: 'Instagram Embroidery Designs',
  description:
    'Tap a design from our Instagram to see it on Embroidize and download the embroidery file.',
  alternates: {
    canonical: 'https://embroidize.com/instagram-embroidery-designs',
  },
  // Listed in the static sitemap, so it is indexable.
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Instagram Embroidery Designs | Embroidize',
    url: 'https://embroidize.com/instagram-embroidery-designs',
    images: [
      { url: 'https://embroidize.com/og-banner.jpg', width: 1200, height: 630 },
    ],
  },
};

export default async function LinksPage() {
  const { items, hasMore } = await getLinkInBioPage(1);

  return (
    <div className='mx-auto w-full max-w-6xl px-3 pb-12 pt-8 sm:px-4'>
      <header className='flex flex-col items-center text-center'>
        <Link href={`/?${UTM}`} aria-label='Embroidize home'>
          <Image
            src='/logo-black.png'
            alt='Embroidize'
            width={200}
            height={64}
            priority
          />
        </Link>
      </header>

      <Link
        href={`/?${UTM}`}
        className='mt-4 block w-full rounded-md border border-gray-800 bg-white py-3 text-center text-sm font-medium text-gray-900 transition-colors hover:bg-gray-900 hover:text-white'
      >
        Shop the website!
      </Link>

      <p className='mt-6 bg-gray-100 py-1.5 text-center text-xs text-gray-700'>
        Tap on an image to learn more
      </p>

      {items.length ? (
        <LinkInBioGrid
          initialItems={items}
          initialHasMore={hasMore}
          utm={UTM}
        />
      ) : (
        <p className='mt-10 text-center text-sm text-gray-500'>
          New designs are on their way.{' '}
          <Link href={`/products?${UTM}`} className='underline'>
            Browse all designs
          </Link>
          .
        </p>
      )}
    </div>
  );
}
