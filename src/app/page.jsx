import AdminChoiceDesign from '@/components/user/HomePage/AdminChoiceSection';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import PopularDesign from '@/components/user/HomePage/PopularDesign';
import RecentBundleSection from '@/components/user/HomePage/RecentBundleSection';
import RecentProductsSection from '@/components/user/HomePage/RecentProductsSection';
import { getAllBundlesForDashboard } from '@/lib/apis/protected/bundles';
import {
  getAdminChoiceProducts,
  getPopularProducts,
  getProducts,
} from '@/lib/apis/public/products';
import Image from 'next/image';
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
  const [popularPromise, adminChoicePromise, recentPromise, bundlePromise] = [
    getPopularProducts('', 1, 8, { cache: 'no-store' }),
    getAdminChoiceProducts('', 1, 8, { cache: 'no-store' }),
    getProducts('', 1, 8, { cache: 'no-store' }),
    getAllBundlesForDashboard('', 1, 8, { cache: 'no-store' }),
  ];

  const [popularProducts, adminChoiceProducts, recentProducts, bundles] =
    await Promise.all([
      popularPromise,
      adminChoicePromise,
      recentPromise,
      bundlePromise,
    ]);

  return (
    <>
      <link
        rel='preconnect'
        href='https://cloud.digitalocean.com/spaces/embroidize-assets?i=9cf06e'
        crossOrigin=''
      />

      <ProductUpdates />
      <Header />

      <section className='w-full overflow-hidden'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20'>
          <div className='flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16'>
            {/* LEFT: Text */}
            <div className='w-full lg:w-1/2 text-center lg:text-left'>
              <h1
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
                className='text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight'
              >
                Free Machine Embroidery Designs
              </h1>

              <p className='mt-4 text-base md:text-lg text-gray-700 max-w-2xl mx-auto lg:mx-0'>
                All you need for your next machine embroidery project.
                <br className='hidden sm:block' />
                The highest quality for free.
              </p>

              <Link
                href='/products'
                className='mt-6 inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm sm:text-base font-semibold text-white hover:opacity-90'
              >
                Browse Designs
              </Link>
            </div>

            {/* RIGHT: Big Image (animated) */}
            <div className='w-full lg:w-1/2 flex justify-center lg:justify-end'>
              <Link
                href='/custom-embroidery-digitizing-service'
                aria-label='Download designs'
                className='
             animate-float
            rounded-2xl bg-white/90 backdrop-blur
            shadow-2xl ring-1 ring-black/10
            transition-transform duration-300 hover:scale-[1.02]
            p-3
          '
              >
                {/* Bigger + controlled size */}
                <div className='relative overflow-hidden rounded-xl h-[14rem] w-[22rem] sm:h-[15rem] sm:w-[23rem]'>
                  <Image
                    src='/hero-image.jpeg'
                    alt='Free embroidery designs preview'
                    fill
                    priority
                    sizes='(min-width: 1024px) 560px, (min-width: 640px) 90vw, 100vw'
                    className='object-cover'
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby='popular-designs-heading'
        className=' text-black mb-8 py-6'
      >
        <div className='bg-[#fafafa] flex flex-col items-center justify-center gap-2 py-6 mb-6'>
          <h2
            id='popular-designs-heading'
            className='text-2xl sm:text-2xl md:text-3xl text-center font-bold leading-snug'
          >
            Most Trending Designs Of{' '}
            <span className='block sm:inline'>The Month</span>
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

      {/* Admin Choice Embroidery Designs Section */}
      <section
        aria-labelledby='popular-designs-heading'
        className=' text-black my-8 py-6'
      >
        <div className='bg-[#fafafa] flex flex-col items-center justify-center gap-2 py-6 mb-6'>
          <h2
            id='popular-designs-heading'
            className='text-2xl sm:text-2xl md:text-3xl text-center font-bold leading-snug'
          >
            Embroidize Choice Embroidery Designs
          </h2>

          <p className='text-base sm:text-base md:text-lg font-medium text-gray-600'>
            Best designs we recommend.
          </p>
        </div>

        <Suspense fallback={<GridSkeleton />}>
          {/* Make sure AdminChoiceDesign is a **server component** (no 'use client') */}
          {adminChoiceProducts?.products?.length ? (
            <AdminChoiceDesign adminChoiceProducts={adminChoiceProducts} />
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
            className='text-2xl sm:text-2xl md:text-3xl text-center font-bold leading-snug'
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
          <h2 className='text-2xl sm:text-2xl md:text-3xl text-center font-bold leading-snug'>
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
