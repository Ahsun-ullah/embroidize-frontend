import BlogSection from '@/components/user/HomePage/BlogSection';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import PopularDesign from '@/components/user/HomePage/PopularDesign';
import RecentProductsSection from '@/components/user/HomePage/RecentProductsSection';
import { getBlogs } from '@/lib/apis/public/blog';
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
  const [popularPromise, recentPromise, blogsPromise] = [
    getPopularProducts('', 1, 12, { cache: 'no-store' }),
    getProducts('', 1, 8, { cache: 'no-store' }),
    getBlogs({ cache: 'no-store' }),
  ];

  const [popularProducts, recentProducts, { blogs }] = await Promise.all([
    popularPromise,
    recentPromise,
    blogsPromise,
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
            <h1 style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
            }} className='text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold my-2 text-center'>
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

      {/* popular section] */}
      {/* <section
        style={{ backgroundColor: '#fafafa' }}
        className=' text-black my-8 py-6'
      >
        <div>
          <div className='flex items-center justify-center '>
            <h4
              id='popular-designs-heading'
              className='text-3xl font-bold text-center'
            >
              Popular embroidery designs
            </h4>
          </div>
          <div className='flex items-center justify-center mt-2'>
            <h4 className='font-semibold text-center'>
              Browse Our Most Loved Designs.
            </h4>
          </div>
        </div>
      </section>
      {popularProducts?.products && popularProducts?.products?.length > 0 && (
        <Suspense fallback={<LoadingSpinner />}>
          <PopularDesign popularProducts={popularProducts} />
        </Suspense>
      )} */}

      <section
        aria-labelledby='popular-designs-heading'
        className=' text-black my-8 py-6'
      >
        <div className='bg-[#fafafa] flex flex-col items-center justify-center gap-2 py-6 mb-6'>
          <h2
            id='popular-designs-heading'
            className='text-3xl font-bold text-center'
          >
            Popular embroidery designs
          </h2>
          <p className='font-semibold text-center'>
            Browse Our Most Loved Designs.
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

      {/* recent products section */}
      {/* <section
        style={{ backgroundColor: '#fafafa' }}
        className=' text-black my-8 py-6'
      >
        <div>
          <div className='flex items-center justify-center'>
            <h4 className='text-3xl font-bold text-center'>
              Recent Approved Products
            </h4>
          </div>
          <div className='flex items-center justify-center mt-4'>
            <h4 className='font-semibold text-center'>
              Our Newest Creations, Just for You.
            </h4>
          </div>
        </div>
      </section>

      {recentProducts?.products && recentProducts?.products?.length > 0 && (
        <Suspense fallback={<LoadingSpinner />}>
          <RecentProductsSection recentProducts={recentProducts} />
        </Suspense>
      )} */}

      <section className=' text-black my-8 py-6'>
        <div className=' bg-[#fafafa] flex flex-col items-center justify-center gap-2 py-6 mb-6'>
          <h2 className='text-3xl font-bold text-center'>
            Recent Approved Products
          </h2>
          <p className='font-semibold text-center'>
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

      {blogs?.length > 0 && (
        <>
          <Suspense
            fallback={
              <div className='px-4'>
                <div className='h-6 w-48 bg-gray-200 rounded animate-pulse mb-4' />
                <GridSkeleton rows={1} cols={3} />
              </div>
            }
          >
            <BlogSection blogs={blogs} />
          </Suspense>
          <div className='flex justify-center items-center my-10'>
            <Link
              href='/blog'
              className='bg-black rounded-full hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-colors text-white font-medium px-6 py-2'
            >
              View All
            </Link>
          </div>
        </>
      )}

      <Footer />
    </>
  );
}
