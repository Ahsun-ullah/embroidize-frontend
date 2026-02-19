import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ProductCard from '@/components/Common/ProductCard';
import SearchBox from '@/components/Common/SearchBox';
import UserProfileDropdown from '@/components/Common/UserProfileDropdown';
import Footer from '@/components/user/HomePage/Footer';
import { getPopularProducts } from '@/lib/apis/public/products';
import { Navbar as HeroUINavbar, NavbarContent } from '@heroui/navbar';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
const mainLogo = '/logo-black.png';
const mobileLogo = '/favicon.png';

// Dynamic data fetching
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// SEO Metadata for Landing Page
export const metadata = {
  title: 'Download 13,000+ Free Machine Embroidery Designs | Embroidize',
  description:
    'Get instant access to 13,000+ free embroidery designs. No credit card required. Download unlimited machine embroidery patterns in all popular formats.',
  keywords: [
    'free embroidery designs download',
    'machine embroidery patterns',
    'free embroidery files',
    'embroidery design library',
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://embroidize.com/free-machine-embroidery-designs',
  },
  openGraph: {
    title: 'Download 13,000+ Free Machine Embroidery Designs',
    description:
      'Get instant access to 13,000+ free embroidery designs. No credit card required.',
    url: 'https://embroidize.com/free-machine-embroidery-designs',
    siteName: 'Embroidize',
    images: [
      {
        url: 'https://embroidize.com/og-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Free Machine Embroidery Designs',
      },
    ],
    type: 'website',
  },
};

// Skeleton loader
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

export default async function LandingPage() {
  const [popularPromise] = [
    getPopularProducts('', 1, 12, { cache: 'no-store' }),
  ];

  const [popularProducts] = await Promise.all([popularPromise]);
  const { products: allProducts } = popularProducts;

  return (
    <>
      <HeroUINavbar maxWidth='full' className='h-[5.5rem] z-50'>
        <div className='container mx-auto flex items-center justify-center gap-x-4'>
          <NavbarContent justify='start' className='flex-1'>
            <Link
              href='/'
              prefetch={false}
              aria-label='Go to homepage'
              className='relative w-[30px] h-[30px] sm:w-[60px] sm:h-[60px] md:w-[120px] md:h-[80px]'
            >
              <Image
                src={mobileLogo}
                alt='Embroidize Logo'
                fill
                priority
                sizes='(max-width: 640px) 80px'
                className='object-contain block sm:hidden'
              />

              <Image
                src={mainLogo}
                alt='Embroidize Logo'
                fill
                priority
                sizes='(min-width: 640px) 120px'
                className='object-contain hidden sm:block'
              />
            </Link>

            {/* <div className='sm:flex items-center gap-x-2 text-base font-bold text-gray-700 sm:ms-6 md:ms-8'>
              <button
                onClick={toggleMenu}
                className='flex items-center gap-2 text-gray-800 font-bold focus:outline-none focus-visible:ring focus-visible:ring-gray-400 rounded'
                aria-expanded={isMobileMenuOpen}
                aria-controls='category-menu'
                type='button'
              >
                <i
                  className={`${
                    isMobileMenuOpen ? 'ri-menu-2-line' : 'ri-menu-3-line'
                  }`}
                  aria-hidden='true'
                />
                <span className='hidden sm:inline font-bold'>Categories</span>
              </button>
            </div> */}
          </NavbarContent>

          <NavbarContent justify='center' className='flex-1'>
            <SearchBox />
          </NavbarContent>

          <NavbarContent justify='end' className='flex-1'>
            <UserProfileDropdown />
          </NavbarContent>
        </div>
      </HeroUINavbar>

      {/* Hero Section with Strong CTA */}
      <section className='relative w-full overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100'>
        <div className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20 pt-4 sm:pb-24 lg:pb-32'>
          <div className='text-center'>
            {/* Trust Badge */}
            <div className='inline-block mb-6 px-6 py-3 bg-green-100 text-green-700 rounded-full text-base font-bold shadow-md'>
              ✓ 100% Free • No Credit Card Required • Instant Access
            </div>

            {/* Main Headline */}
            <h1
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
              className='text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6'
            >
              Download 13,000+ Free
              <br />
              <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                Machine Embroidery Designs
              </span>
            </h1>

            {/* Subheadline */}
            <p className='mt-6 text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium'>
              Compatible with Brother, Janome & Singer. Instant access to
              premium designs in all formats:
              <br className='hidden sm:block' />
              <span className='text-gray-900 font-bold'>
                DST • PES • JEF • EXP • VP3 & More
              </span>
            </p>

            {/* Primary CTA Buttons */}
            <div className='mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center'>
              <Link
                href='/auth/register'
                className='group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-12 py-5 text-lg sm:text-xl font-bold text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 w-full sm:w-auto'
              >
                <span className='relative z-10'>Create Free Account →</span>
                <div className='absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity'></div>
              </Link>
            </div>

            {/* Social Proof Numbers */}
            <div className='mt-6 pt-4 border-t border-gray-300'>
              <div className='grid grid-cols-3 gap-8 max-w-2xl mx-auto'>
                <div className='text-center'>
                  <div className='text-4xl sm:text-5xl font-extrabold text-gray-900'>
                    13,000+
                  </div>
                  <div className='mt-2 text-sm sm:text-base text-gray-600 font-medium'>
                    Free Designs
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-4xl sm:text-5xl font-extrabold text-gray-900'>
                    5,000+
                  </div>
                  <div className='mt-2 text-sm sm:text-base text-gray-600 font-medium'>
                    Happy Users
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-4xl sm:text-5xl font-extrabold text-gray-900'>
                    100%
                  </div>
                  <div className='mt-2 text-sm sm:text-base text-gray-600 font-medium'>
                    Free Forever
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className='absolute bottom-0 left-0 right-0'>
          <svg
            viewBox='0 0 1440 120'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z'
              fill='white'
            />
          </svg>
        </div>
      </section>

      {/* Benefits Section */}
      <section className='pb-16 bg-white'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900'>
              Why Choose Embroidize?
            </h2>
            <p className='mt-4 text-lg text-gray-600'>
              Everything you need for perfect embroidery projects
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* Benefit 1 */}
            <div className='text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors'>
              <div className='w-16 h-16 mx-auto mb-4 bg-black rounded-full flex items-center justify-center'>
                <svg
                  className='w-8 h-8 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-bold mb-2'>Instant Downloads</h3>
              <p className='text-gray-600'>
                Download any design immediately after signup. No waiting, no
                limits.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className='text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors'>
              <div className='w-16 h-16 mx-auto mb-4 bg-black rounded-full flex items-center justify-center'>
                <svg
                  className='w-8 h-8 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-bold mb-2'>Premium Quality</h3>
              <p className='text-gray-600'>
                Every design is manually digitized and tested to ensure no
                thread breaks or jumps.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className='text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors'>
              <div className='w-16 h-16 mx-auto mb-4 bg-black rounded-full flex items-center justify-center'>
                <svg
                  className='w-8 h-8 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-bold mb-2'>All Formats</h3>
              <p className='text-gray-600'>
                We provide every format (PES, DST, JEF, VP3, XXX) so you never
                have to convert files.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className='mb-12 flex flex-col sm:flex-row gap-4 justify-center items-center'>
        <Link
          href='/auth/register'
          className='group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-12 py-5 text-lg sm:text-xl font-bold text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 w-full sm:w-auto'
        >
          <span className='relative z-10'>
            Unlock All Designs – Sign Up Free
          </span>
          <div className='absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity'></div>
        </Link>
      </div>

      {/* Popular Designs Section */}
      <section
        aria-labelledby='popular-designs-heading'
        className='bg-gray-50 text-black py-16'
      >
        <div className='flex flex-col items-center justify-center gap-2 mb-12'>
          <h2
            id='popular-designs-heading'
            className='text-3xl sm:text-4xl font-bold text-center'
          >
            Most Trending Designs Of The Month
          </h2>
          <p className='text-lg text-gray-600'>
            See what our community loves most
          </p>
        </div>

        <Suspense fallback={<GridSkeleton />}>
          {popularProducts?.products?.length ? (
            <div className='container mx-auto px-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                <Suspense fallback={<LoadingSpinner />}>
                  {allProducts?.length > 0 &&
                    allProducts.map((item, index) => (
                      <ProductCard key={item._id} item={item} index={index} />
                    ))}
                </Suspense>
              </div>

              <div className='mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center'>
                <Link
                  href='/auth/register'
                  className='group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-12 py-5 text-lg sm:text-xl font-bold text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 w-full sm:w-auto'
                >
                  <span className='relative z-10'>Unlock Full Library</span>
                  <div className='absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity'></div>
                </Link>
              </div>
            </div>
          ) : (
            <GridSkeleton />
          )}
        </Suspense>
      </section>

      {/* How It Works Section */}
      <section className='py-14 bg-white'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Heading */}
          <div className='text-center mb-10'>
            <h2 className='text-2xl sm:text-3xl font-bold text-gray-900'>
              How It Works
            </h2>
          </div>

          {/* Steps */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-14'>
            {/* Step 1 */}
            <div className='bg-gray-50 p-6 text-center rounded-md'>
              <div className='w-12 h-12 mx-auto mb-4 bg-black rounded-full flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <h3 className='text-base font-bold text-gray-900 mb-2'>
                Create Free Account
              </h3>
              <div className='flex items-center justify-center text-gray-700 text-sm font-semibold'>
                <svg
                  className='w-4 h-4 mr-2 text-black'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
                Sign up free with your email
              </div>
            </div>

            {/* Step 2 */}
            <div className='bg-gray-50 p-6 text-center rounded-md'>
              <div className='w-12 h-12 mx-auto mb-4 bg-black rounded-full flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <h3 className='text-base font-bold text-gray-900 mb-2'>
                Browse 13k+ Designs
              </h3>
              <div className='flex items-center justify-center text-gray-700 text-sm font-semibold'>
                <svg
                  className='w-4 h-4 mr-2 text-black'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
                Find the perfect embroidery file
              </div>
            </div>

            {/* Step 3 */}
            <div className='bg-gray-50 p-6 text-center rounded-md'>
              <div className='w-12 h-12 mx-auto mb-4 bg-black rounded-full flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <h3 className='text-base font-bold text-gray-900 mb-2'>
                Download Instantly
              </h3>
              <div className='flex items-center justify-center text-gray-700 text-sm font-semibold'>
                <svg
                  className='w-4 h-4 mr-2 text-black'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
                Get your files immediately
              </div>
            </div>
          </div>

          {/* Trusted Section */}
          <div className='text-center'>
            <h3 className='text-xl sm:text-2xl font-bold text-gray-900 mb-6'>
              Trusted by Embroidery Lovers Worldwide
            </h3>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-10 max-w-3xl mx-auto text-left'>
              <div className='flex items-center font-bold text-gray-800'>
                <svg
                  className='w-5 h-5 mr-3 text-black'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
                13,000+ Designs Available
              </div>

              <div className='flex items-center font-bold text-gray-800'>
                <svg
                  className='w-5 h-5 mr-3 text-black'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
                Free for Personal & Commercial Use
              </div>

              <div className='flex items-center font-bold text-gray-800'>
                <svg
                  className='w-5 h-5 mr-3 text-black'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
                New Designs Added Daily
              </div>

              <div className='flex items-center font-bold text-gray-800'>
                <svg
                  className='w-5 h-5 mr-3 text-black'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
                Secure & Fast Access
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className='bg-gradient-to-br from-gray-800 via-gray-600 to-gray-800 py-16 sm:py-20'>
        <div className='  mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center'>
          {/* Main Headline */}
          <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2'>
            Ready to Download Your Free Designs?
          </h2>

          {/* Sub-headline */}
          <p className='text-base sm:text-lg text-white mb-4'>
            Create your free account and start stitching today.
          </p>

          {/* CTA Button */}
          <Link
            href='/auth/register'
            className='inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto'
          >
            Create Free Account →
          </Link>

          {/* Social Proof */}
          <p className='mt-2 text-base text-white italic'>
            Join 5,000+ embroidery lovers today.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
