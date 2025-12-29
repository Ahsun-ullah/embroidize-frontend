import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import PopularDesign from '@/components/user/HomePage/PopularDesign';
import RecentBundleSection from '@/components/user/HomePage/RecentBundleSection';
import RecentProductsSection from '@/components/user/HomePage/RecentProductsSection';
import { getAllBundlesForDashboard } from '@/lib/apis/protected/bundles';
import { getPopularProducts, getProducts } from '@/lib/apis/public/products';
import Link from 'next/link';
import { Suspense } from 'react';
import ProductUpdates from './products/ProductUpdates';
// for dynamic data fetching and no caching
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// SEO Metadata
export const metadata = {
  title: 'Free Machine Embroidery Designs - Embroidize',
  description:
    'Download free embroidery designs instantly – Browse unlimited machine embroidery Design in multiple categories and styles. All designs are tested and come in the most popular formats.',
  keywords: [
    'free embroidery machine designs',
    'Embroidery design',
    'Machine embroidery designs',
    'machine embroidery file',
    'Machine embroidery patterns',
    'free embroidery files',
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://embroidize.com/',
  },
  openGraph: {
    title: 'Free Machine Embroidery Designs - Embroidize',
    description:
      'Download free embroidery designs instantly – Browse unlimited machine embroidery Design in multiple categories and styles.',
    url: 'https://embroidize.com/',
    siteName: 'Embroidize',
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
      'Download free embroidery designs instantly – Browse unlimited machine embroidery Design in multiple categories and styles.',
    images: ['https://embroidize.com/og-banner.jpg'],
  },
};

// server-only skeleton
function GridSkeleton({ rows = 2, cols = 6 }) {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 px-4'>
      {Array.from({ length: rows * cols }).map((_, i) => (
        <div key={i} className='animate-pulse'>
          <div className='aspect-square rounded-xl bg-gray-200' />
          <div className='mt-2 h-3 rounded bg-gray-200' />
        </div>
      ))}
    </div>
  );
}

export default async function Home() {
  const [popularPromise, recentPromise, bundlePromise] = [
    getPopularProducts('', 1, 12, { cache: 'no-store' }),
    getProducts('', 1, 8, { cache: 'no-store' }),
    getAllBundlesForDashboard('', 1, 4, { cache: 'no-store' }),
  ];

  const [popularProducts, recentProducts, bundles] = await Promise.all([
    popularPromise,
    recentPromise,
    bundlePromise,
  ]);

  console.log(bundles?.bundles);

  return (
    <>
      <link
        rel='preconnect'
        href='https://cloud.digitalocean.com/spaces/embroidize-assets?i=9cf06e'
        crossOrigin=''
      />

      <ProductUpdates />
      <Header />

      {/* hero section */}
      {/* <section className='w-full flex items-center overflow-hidden'>
        <div className='flex items-center justify-center w-full m-[30px] sm:m-[40px] md:m-[40px] lg:m-[60px] xl:m-[70px] 2xl:m-[80px]'>
          <div className='flex flex-col items-center justify-center '>
            <h1 className='text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold my-2 text-center'>
              Free Machine Embroidery Designs
            </h1>
            <p className='text-base sm:text-base md:text-lg text-center my-2 max-w-2xl'>
              All you need for your next machine embroidery project. <br /> The
              highest quality for free.
            </p>
            <Link
              href='/products'
              prefetch={false}
              className=' text-black text-xs sm:text-base md:text-lg font-bold transition duration-300 ease-in-out hover:opacity-60 focus:opacity-60 px-4 py-1 rounded-full mt-4'
              passHref
            >
              <span
                style={{
                  padding: '9px 24px',
                  borderRadius: '9999px',
                }}
                className='button rounded-md'
              >
                Download Now
              </span>
            </Link>
          </div>
        </div>
      </section> */}

      <section className='w-full flex items-center overflow-hidden'>
        <div className='flex items-center justify-center w-full m-[30px] sm:m-[40px] md:m-[40px] lg:m-[60px] xl:m-[70px] 2xl:m-[80px]'>
          <div className='flex flex-col items-center justify-center'>
            <h1
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
              }}
              className='text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold my-2 text-center'
            >
              Free Machine Embroidery Designs
            </h1>
            <p className='text-base sm:text-base md:text-lg text-center my-2 max-w-2xl'>
              All you need for your next machine embroidery project. <br /> The
              highest quality for free.
            </p>
            <Link
              href='/products'
              className='text-black text-xs sm:text-base md:text-lg font-bold hover:opacity-60 px-4 py-1 rounded-full mt-4'
            >
              <span
                style={{ padding: '9px 24px', borderRadius: '9999px' }}
                className='button rounded-md'
              >
                Download Now
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Bundle Designs Section */}
      <section
        aria-labelledby='popular-designs-heading'
        className=' text-black my-8 py-6'
      >
        <div className='bg-[#fafafa] flex flex-col items-center justify-center gap-2 py-6 mb-6'>
          <h2
            id='popular-designs-heading'
            className='text-2xl sm:text-2xl md:text-3xl font-bold leading-snug'
          >
            Popular embroidery designs
          </h2>

          <p className='text-base sm:text-base md:text-lg font-medium text-gray-600'>
            Browse our most loved designs.
          </p>
        </div>

        <Suspense fallback={<GridSkeleton />}>
          {/* Make sure PopularDesign is a **server component** (no 'use client') */}
          {popularProducts?.products?.length ? (
            <PopularDesign popularProducts={popularProducts} />
          ) : (
            <GridSkeleton />
          )}
        </Suspense>
      </section>

      {/* Popular Bundle Designs Section */}
      <section
        aria-labelledby='popular-bundles-heading'
        className='text-black my-8 py-6'
      >
        <div className='bg-[#fafafa] flex flex-col items-center justify-center gap-2 py-6 mb-6'>
          <h2
            id='popular-bundles-heading'
            className='text-2xl sm:text-2xl md:text-3xl font-bold leading-snug'
          >
            Popular Bundle Designs
          </h2>

          <p className='text-base sm:text-base md:text-lg font-medium text-gray-600'>
            Browse our most loved bundle designs.
          </p>
        </div>

        <Suspense fallback={<GridSkeleton />}>
          {bundles?.bundles?.length ? (
            <RecentBundleSection recentBundles={bundles} />
          ) : (
            <GridSkeleton />
          )}
        </Suspense>
      </section>

      {/* Recent Designs Section */}
      <section className=' text-black my-8 py-6'>
        <div className=' bg-[#fafafa] flex flex-col items-center justify-center gap-2 py-6 mb-6'>
          <h2 className='text-2xl sm:text-2xl md:text-3xl font-bold leading-snug'>
            Recent Approved Products
          </h2>

          <p className='text-base sm:text-base md:text-lg font-medium text-gray-600'>
            Our Newest Creations, Just for You.
          </p>
        </div>

        <Suspense fallback={<GridSkeleton />}>
          {recentProducts?.products?.length ? (
            <RecentProductsSection recentProducts={recentProducts} />
          ) : (
            <GridSkeleton />
          )}
        </Suspense>
      </section>

      <Footer />
    </>
  );
}
