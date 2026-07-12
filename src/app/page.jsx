import AdminChoiceDesign from '@/components/user/HomePage/AdminChoiceSection';
import BrowseCategories from '@/components/user/HomePage/BrowseCategories';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import MostFavoritedDesigns from '@/components/user/HomePage/MostFavoritedDesigns';
import RecentBundleSection from '@/components/user/HomePage/RecentBundleSection';
import RecentProductsSection from '@/components/user/HomePage/RecentProductsSection';
import { getAllBundlesForDashboard } from '@/lib/apis/protected/bundles';
import {
  getAdminChoiceProducts,
  getMostFavoritedProducts,
  getPopularProducts,
  getProducts,
} from '@/lib/apis/public/products';
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Download,
  ShieldCheck,
  Sparkles,
  Timer,
} from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import ProductUpdates from './products/ProductUpdates';
import PopularDesign from '@/components/user/HomePage/PopularDesign';
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
  const [
    popularPromise,
    adminChoicePromise,
    recentPromise,
    bundlePromise,
    mostFavoritedPromise,
  ] = [
    getPopularProducts('', 1, 8, { cache: 'no-store' }),
    getAdminChoiceProducts('', 1, 8, { cache: 'no-store' }),
    getProducts('', 1, 8, { cache: 'no-store' }),
    getAllBundlesForDashboard('', 1, 8, { cache: 'no-store' }),
    getMostFavoritedProducts('', 1, 8, { cache: 'no-store' }),
  ];

  const [
    popularProducts,
    adminChoiceProducts,
    recentProducts,
    bundles,
    mostFavoritedProducts,
  ] = await Promise.all([
    popularPromise,
    adminChoicePromise,
    recentPromise,
    bundlePromise,
    mostFavoritedPromise,
  ]);

  return (
    <div className='bg-[#f4f4f4]'>
      <link
        rel='preconnect'
        href='https://cloud.digitalocean.com/spaces/embroidize-assets?i=9cf06e'
        crossOrigin=''
      />

      <ProductUpdates />

      <Suspense fallback={<GridSkeleton />}>
        <Header />
      </Suspense>

      <section className='container overflow-hidden py-10 sm:py-12  mx-auto max-w-7xl'>
        <div className='flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16'>
          {/* LEFT: Text */}
          <div className='w-full lg:w-1/2 text-center lg:text-left'>
            {/* Badge */}
            <span className='inline-flex items-center gap-2 rounded-full bg-gray-300/70 px-4 py-1.5 text-sm font-semibold text-black'>
              <Sparkles className='h-4 w-4' aria-hidden />
              100% Free Designs
            </span>

            {/* Heading */}
            <h1
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}
              className='mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-slate-900'
            >
              Free Machine Embroidery Designs
            </h1>

            {/* Coral underline swoosh */}
            <svg
              className='mx-auto lg:mx-0 mt-3 h-3 w-32 text-rose-500'
              viewBox='0 0 120 12'
              fill='none'
              aria-hidden
            >
              <path
                d='M2 8C30 2 70 2 118 6'
                stroke='currentColor'
                strokeWidth='3.5'
                strokeLinecap='round'
              />
            </svg>

            {/* Subtitle */}
            <p className='mt-5 text-base md:text-lg text-slate-500 max-w-xl mx-auto lg:mx-0'>
              Thousands of high quality machine embroidery designs.
              <br className='hidden sm:block' />
              Perfect for your next project.
            </p>

            {/* Feature rows */}
            <div className='mt-7 space-y-4'>
              <div className='flex items-center gap-3 justify-center lg:justify-start'>
                <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500'>
                  <BadgeCheck className='h-6 w-6' aria-hidden />
                </span>
                <div className='text-left'>
                  <p className='font-bold text-slate-900'>Premium Quality</p>
                  <p className='text-sm text-slate-500'>
                    Professionally digitized designs
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-3 justify-center lg:justify-start'>
                <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600'>
                  <Download className='h-6 w-6' aria-hidden />
                </span>
                <div className='text-left'>
                  <p className='font-bold text-slate-900'>Instant Download</p>
                  <p className='text-sm text-slate-500'>
                    Get your files immediately
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              href='/products'
              className='group mt-8 inline-flex w-full sm:w-auto items-center justify-center sm:justify-between gap-3 sm:gap-5 rounded-full bg-black py-3 px-5 sm:px-7 text-base font-semibold text-white shadow-lg shadow-gray-500/30 transition hover:bg-gray-800'
            >
              Browse Designs
              <span className='flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 transition-transform group-hover:translate-x-0.5'>
                <ArrowRight className='h-5 w-5' aria-hidden />
              </span>
            </Link>
          </div>

          <div className='w-full lg:w-1/2 flex justify-center lg:justify-end'>
            {/* ───────── DESKTOP / BIG DEVICES (lg and up) ───────── */}
            <Link
              href='/custom-embroidery-digitizing-service'
              aria-label='Custom embroidery digitizing service, starting at $5'
              className='animate-float hidden lg:block relative w-full max-w-md rounded-3xl bg-[#ffffff] p-16 shadow-md ring-1 ring-black/5 transition-transform duration-300 hover:scale-[1.01]'
            >
              {/* Decorative triangles */}
              <svg
                viewBox='0 0 120 110'
                className='absolute right-6 top-6 h-16 w-20'
                aria-hidden
              >
                <path
                  d='M40 12 L17 52 L63 52 Z'
                  fill='#F6B24E'
                  stroke='#F6B24E'
                  strokeWidth='9'
                  strokeLinejoin='round'
                />
                <path
                  d='M88 6 L66 44 L110 44 Z'
                  fill='#8FE0B6'
                  stroke='#8FE0B6'
                  strokeWidth='9'
                  strokeLinejoin='round'
                />
                <path
                  d='M52 96 L30 56 L74 56 Z'
                  fill='#F7C3D0'
                  stroke='#F7C3D0'
                  strokeWidth='9'
                  strokeLinejoin='round'
                />
              </svg>

              {/* Heading */}
              <h2 className='text-4xl font-extrabold leading-[1.05] tracking-tight text-[#0f1b34]'>
                Custom
                <br />
                Embroidery
                <br />
                Digitizing
              </h2>

              {/* Starting at $5 */}
              <div className='mt-7 flex items-baseline gap-3'>
                <span className='text-xl font-bold text-[#0f1b34]'>
                  Starting at
                </span>
                <span className='text-3xl font-extrabold leading-none text-rose-500'>
                  $5
                </span>
              </div>

              {/* Features */}
              <ul className='mt-8 space-y-4'>
                <li className='flex items-center gap-3'>
                  <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-rose-200 text-rose-500'>
                    <Timer className='h-5 w-5' aria-hidden />
                  </span>
                  <span className='text-base font-semibold text-[#0f1b34]'>
                    1 Hour Turnaround Time
                  </span>
                </li>
                <li className='flex items-center gap-3'>
                  <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-rose-200 text-rose-500'>
                    <Clock className='h-5 w-5' aria-hidden />
                  </span>
                  <span className='text-base font-semibold text-[#0f1b34]'>
                    24 Hours Service
                  </span>
                </li>
                <li className='flex items-center gap-3'>
                  <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-rose-200 text-rose-500'>
                    <ShieldCheck className='h-5 w-5' aria-hidden />
                  </span>
                  <span className='text-base font-semibold text-[#0f1b34]'>
                    100% Satisfaction
                  </span>
                </li>
              </ul>

              {/* Order Now */}
              <span className='mt-8 flex w-full items-center justify-between rounded-full bg-black px-7 py-5 text-base font-bold text-white'>
                Order Now
                <ArrowRight className='h-5 w-5' aria-hidden />
              </span>
            </Link>

            {/* ───────── MOBILE / TABLET (below lg) ───────── */}
            <Link
              href='/custom-embroidery-digitizing-service'
              aria-label='Custom embroidery digitizing service, starting at $5'
              className='animate-float lg:hidden w-full max-w-xl rounded-3xl bg-[#ffffff] p-6 sm:p-8 shadow-md ring-1 ring-black/5 transition-transform duration-300 hover:scale-[1.01]'
            >
              <div className='flex flex-row items-stretch gap-4 sm:gap-8'>
                {/* LEFT */}
                <div className='flex min-w-0 flex-1 flex-col'>
                  <h2 className='text-2xl sm:text-4xl font-extrabold leading-[1.05] tracking-tight text-[#0f1b34]'>
                    Custom
                    <br />
                    Embroidery
                    <br />
                    Digitizing
                  </h2>

                  <span className='mt-6 inline-flex w-fit shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded-full border-2 border-rose-500 bg-white py-1.5 pl-5 pr-1.5 text-sm sm:text-base font-semibold text-rose-500'>
                    Order Now
                    <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white sm:h-8 sm:w-8'>
                      <ArrowRight className='h-4 w-4' aria-hidden />
                    </span>
                  </span>
                </div>

                {/* DIVIDER */}
                <div className='w-px self-stretch bg-black/10' />

                {/* RIGHT */}
                <div className='flex min-w-0 flex-1 flex-col items-center justify-center text-center'>
                  <p className='text-sm sm:text-base font-medium text-slate-600'>
                    Starting at
                  </p>
                  <p className='text-4xl sm:text-6xl font-extrabold leading-none text-rose-500'>
                    $5
                  </p>

                  <div className='mt-5 flex flex-col gap-4 sm:flex-row sm:gap-8'>
                    <div className='flex flex-col items-center'>
                      <Clock
                        className='h-7 w-7 text-rose-500'
                        strokeWidth={2}
                        aria-hidden
                      />
                      <p className='mt-2 font-bold text-slate-900'>24 Hours</p>
                      <p className='text-xs text-slate-500'>Service</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <BrowseCategories />

      <section
        aria-labelledby='popular-designs-heading'
        className=' text-black mb-8 py-6'
      >
        <div className='bg-[#ffffff] flex flex-col items-center justify-center gap-2 py-6 mb-6'>
          <h2
            id='popular-designs-heading'
            className='text-2xl sm:text-2xl md:text-3xl text-center font-bold leading-snug'
          >
            Most Downloaded Designs
            <br /> Of The Month
          </h2>

          <p className='text-base sm:text-base md:text-lg font-medium text-gray-600'>
            Browse our most loved designs.
          </p>
        </div>

        <Suspense fallback={<GridSkeleton />}>
          {popularProducts?.products?.length ? (
            <PopularDesign popularProducts={popularProducts} />
          ) : (
            <GridSkeleton />
          )}
        </Suspense>
      </section>

      {/* Most Favourited Designs Section */}
      {mostFavoritedProducts?.products?.length ? (
        <section
          aria-labelledby='most-favourited-designs-heading'
          className=' text-black my-8 py-6'
        >
          <div className='bg-[#ffffff] flex flex-col items-center justify-center gap-2 py-6 mb-6'>
            <h2
              id='most-favourited-designs-heading'
              className='text-2xl sm:text-2xl md:text-3xl text-center font-bold leading-snug'
            >
              Most Favourited Designs
            </h2>

            <p className='text-base sm:text-base md:text-lg font-medium text-gray-600'>
              Designs the community loves the most.
            </p>
          </div>

          <Suspense fallback={<GridSkeleton />}>
            <MostFavoritedDesigns
              mostFavoritedProducts={mostFavoritedProducts}
            />
          </Suspense>
        </section>
      ) : null}

      {/* Admin Choice Embroidery Designs Section */}
      <section
        aria-labelledby='popular-designs-heading'
        className=' text-black my-8 py-6'
      >
        <div className='bg-[#ffffff] flex flex-col items-center justify-center gap-2 py-6 mb-6'>
          <h2
            id='popular-designs-heading'
            className='text-2xl sm:text-2xl md:text-3xl text-center font-bold leading-snug'
          >
            Embroidize Choice Designs
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
        <div className='bg-[#ffffff] flex flex-col items-center justify-center gap-2 py-6 mb-6'>
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
        <div className=' bg-[#ffffff] flex flex-col items-center justify-center gap-2 py-6 mb-6'>
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
    </div>
  );
}
