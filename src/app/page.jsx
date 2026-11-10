import HomeEventSections from '@/components/Common/EventPromotions/HomeEventSections';
import AdminChoiceDesign from '@/components/user/HomePage/AdminChoiceSection';
import BrowseCategories from '@/components/user/HomePage/BrowseCategories';
import CustomDigitizingBanner from '@/components/user/HomePage/CustomDigitizingBanner';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import HeroMembershipCard from '@/components/user/HomePage/HeroMembershipCard';
import HomeSection, { HOME_GRID } from '@/components/user/HomePage/HomeSection';
import MostFavoritedDesigns from '@/components/user/HomePage/MostFavoritedDesigns';
import PopularDesign from '@/components/user/HomePage/PopularDesign';
import RecentBundleSection from '@/components/user/HomePage/RecentBundleSection';
import RecentProductsSection from '@/components/user/HomePage/RecentProductsSection';
import { getAllBundlesForDashboard } from '@/lib/apis/protected/bundles';
import { getActiveEventPromotions } from '@/lib/apis/public/eventPromotions';
import {
  getAdminChoiceProducts,
  getMostFavoritedProducts,
  getPopularProducts,
  getProducts,
} from '@/lib/apis/public/products';
import { ArrowRight, BadgeCheck, Download, Sparkles } from 'lucide-react';
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
    'Download free and premium machine embroidery designs instantly in every popular format. Designs marked Free are free to download, and all designs are tested and ready to stitch.',
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
      'Download free and premium machine embroidery designs instantly in every popular format. Designs marked Free are free to download.',
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
      'Download free and premium machine embroidery designs instantly in every popular format. Designs marked Free are free to download.',
    images: ['https://embroidize.com/og-banner.jpg'],
  },
};

// server-only skeleton, same grid and card shape as the real rows
function GridSkeleton({ count = 8 }) {
  return (
    <div className={HOME_GRID}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='animate-pulse pb-4'>
          <div className='aspect-[3/2] rounded-3xl bg-gray-200' />
          <div className='mt-3 h-3 w-3/4 rounded bg-gray-200' />
          <div className='mt-2 h-2.5 w-1/2 rounded bg-gray-200' />
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
    eventPromotionsPromise,
  ] = [
    getPopularProducts('', 1, 8, { cache: 'no-store' }),
    getAdminChoiceProducts('', 1, 4, { cache: 'no-store' }),
    getProducts('', 1, 8, { cache: 'no-store' }),
    getAllBundlesForDashboard('', 1, 4, { cache: 'no-store' }),
    getMostFavoritedProducts('', 1, 8, { cache: 'no-store' }),
    getActiveEventPromotions(),
  ];

  const [
    popularProducts,
    adminChoiceProducts,
    recentProducts,
    bundles,
    mostFavoritedProducts,
    eventPromotions,
  ] = await Promise.all([
    popularPromise,
    adminChoicePromise,
    recentPromise,
    bundlePromise,
    mostFavoritedPromise,
    eventPromotionsPromise,
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

      <section className='relative overflow-hidden border-b border-black/5 bg-white bg-[url("/hero-bg.svg")] bg-cover bg-center'>
        {/* Stitched flowers pinned to the top corners; kept out of the
            background SVG because bg-cover crops its sides on narrow screens. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src='/hero-flower.svg'
          alt=''
          aria-hidden
          className='pointer-events-none absolute left-0 top-0 w-16 sm:w-24 lg:w-28'
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src='/hero-flower.svg'
          alt=''
          aria-hidden
          className='pointer-events-none absolute right-0 top-0 w-16 -scale-x-100 sm:w-24 lg:w-28'
        />
        <div className='container relative mx-auto max-w-7xl py-10 sm:py-12 lg:py-14'>
          <div className='flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16'>
            {/* LEFT: Text */}
            <div className='w-full lg:w-1/2 text-center lg:text-left'>
              {/* Badge */}
              <span className='inline-flex items-center gap-2 rounded-full bg-gray-300/70 px-4 py-1.5 text-sm font-semibold text-black'>
                <Sparkles className='h-4 w-4' aria-hidden />
                Free Designs Available
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

            <HeroMembershipCard />
          </div>
        </div>
      </section>

      {/* Seasonal event posters (Admin → Content → Event Promotions), spot 1 of
          3: "After hero". Each event picks its own spot; empty spots render
          nothing. */}
      <HomeEventSections promotions={eventPromotions} position='after_hero' />

      <BrowseCategories />

      <HomeSection
        id='popular-designs-heading'
        title='Most Downloaded This Month'
        subtitle='Browse our most loved designs.'
        viewAllHref='/products?filter=popular'
        viewAllLabel='View All Popular'
      >
        {popularProducts?.products?.length ? (
          <PopularDesign popularProducts={popularProducts} />
        ) : (
          <GridSkeleton />
        )}
      </HomeSection>

      {/* Event posters, spot 2 of 3: one shared row after the first product
          section. */}
      <HomeEventSections promotions={eventPromotions} position='middle' />

      <CustomDigitizingBanner />

      {mostFavoritedProducts?.products?.length ? (
        <HomeSection
          id='most-favourited-designs-heading'
          title='Most Favourited Designs'
          subtitle='Designs the community loves the most.'
          viewAllHref='/products?filter=most-favourited'
          viewAllLabel='View All Favourites'
          tone='white'
        >
          <MostFavoritedDesigns mostFavoritedProducts={mostFavoritedProducts} />
        </HomeSection>
      ) : null}

      <HomeSection
        id='recent-designs-heading'
        title='Recently Added Designs'
        subtitle='Our newest creations, just for you.'
        viewAllHref='/products?since=30'
        viewAllLabel='View All New Designs'
      >
        {recentProducts?.products?.length ? (
          <RecentProductsSection recentProducts={recentProducts} />
        ) : (
          <GridSkeleton />
        )}
      </HomeSection>

      <HomeSection
        id='embroidize-choice-heading'
        title='Embroidize Choice Designs'
        subtitle='Best designs we recommend.'
        viewAllHref='/products?filter=embroidize-choice'
        viewAllLabel='View All Choice Designs'
      >
        {adminChoiceProducts?.products?.length ? (
          <AdminChoiceDesign adminChoiceProducts={adminChoiceProducts} />
        ) : (
          <GridSkeleton />
        )}
      </HomeSection>

      <HomeSection
        id='popular-bundles-heading'
        title='Popular Bundle Designs'
        subtitle='Browse our most loved bundle designs.'
        viewAllHref='/bundles'
        viewAllLabel='View All Bundles'
        tone='white'
      >
        {bundles?.bundles?.length ? (
          <RecentBundleSection recentBundles={bundles} />
        ) : (
          <GridSkeleton />
        )}
      </HomeSection>

      {/* Event posters, spot 3 of 3: after the last section, before the footer. */}
      <HomeEventSections
        promotions={eventPromotions}
        position='before_footer'
      />

      <Footer />
    </div>
  );
}
