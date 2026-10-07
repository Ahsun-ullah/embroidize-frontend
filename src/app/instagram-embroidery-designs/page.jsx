import { getLinkInBioItems } from '@/lib/apis/public/linkInBio';
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
  const items = await getLinkInBioItems();

  return (
    <div className='mx-auto w-full max-w-3xl px-3 pb-12 pt-8 sm:px-4'>
      <header className='flex flex-col items-center text-center'>
        <Link href={`/?${UTM}`} aria-label='Embroidize home'>
          <Image
            src='/favicon.png'
            alt='Embroidize'
            width={64}
            height={64}
            priority
            className='h-16 w-16 rounded-full'
          />
        </Link>
        <h1 className='mt-2 text-base font-semibold text-gray-900'>
          embroidize
        </h1>
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
        <ul className='mt-2 grid grid-cols-3 gap-2 sm:gap-3'>
          {items.map((item, i) => (
            <li key={item._id}>
              <Link
                href={`/product/${item.slug}?${UTM}`}
                // Same 3:2 frame as the product cards and product page, so designs
                // show whole instead of being cropped to a square.
                className='group relative block aspect-[3/2] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md'
                title={item.name}
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes='(max-width: 768px) 33vw, 256px'
                    quality={78}
                    className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
                    // The first two rows are what a phone shows on arrival.
                    priority={i < 6}
                  />
                ) : (
                  <span className='flex h-full items-center justify-center p-2 text-center text-xs text-gray-500'>
                    {item.name}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
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
