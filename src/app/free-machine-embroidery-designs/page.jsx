import CategoryPills from '@/components/Common/Categorypills';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ProductCard from '@/components/Common/ProductCard';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getPopularProducts } from '@/lib/apis/public/products';
import { getSiteConfig, windowPhrase } from '@/lib/apis/public/siteConfig';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

const mainLogo = '/logo-black.png';

// Dynamic data fetching
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export const metadata = {
  title: 'Free Machine Embroidery Designs | 18,000+ Instant Downloads',
  description:
    'Browse 18,000+ free machine embroidery designs in PES, DST, JEF, VP3, HUS and more. Professionally digitized, commercial use approved. Create a free account for instant access.',
  keywords: [
    'free embroidery designs download',
    'machine embroidery patterns',
    'free embroidery files',
    'embroidery design library',
    'commercial use embroidery designs',
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://embroidize.com/free-machine-embroidery-designs',
  },
  openGraph: {
    title: 'Free Machine Embroidery Designs | 18,000+ Instant Downloads',
    description:
      'Browse 18,000+ free machine embroidery designs in PES, DST, JEF, VP3, HUS and more. Professionally digitized, commercial use approved.',
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

const FILE_FORMATS = [
  { format: 'PES', machines: 'Brother, Baby Lock' },
  { format: 'DST', machines: 'Tajima, most commercial machines' },
  { format: 'JEF', machines: 'Janome, Elna' },
  { format: 'VP3', machines: 'Husqvarna Viking, Pfaff' },
  { format: 'HUS', machines: 'Husqvarna Viking (older models)' },
  { format: 'EXP', machines: 'Melco, Bernina' },
  { format: 'XXX', machines: 'Singer, Compucon' },
];

const MACHINE_BRANDS = [
  'Brother (PES)',
  'Baby Lock (PES)',
  'Janome (JEF)',
  'Elna (JEF)',
  'Husqvarna Viking (VP3)',
  'Pfaff (VP3)',
  'Singer (XXX)',
  'Bernina (EXP)',
  'Tajima commercial (DST)',
  'Melco commercial (EXP)',
];

// The first answer quotes the live free-tier quota (admin-managed), so the FAQ
// and its JSON-LD are built per request instead of at module load.
const buildFaqs = (freeLimit, freeWindow) => [
  {
    q: 'Are the machine embroidery designs on Embroidize really free?',
    a: `Yes. Every design in our free collection is 100% free to download — no hidden fees and no credit card required. Create a free account and download up to ${freeLimit} free designs per ${freeWindow}; your allowance resets automatically.`,
  },
  {
    q: 'Can I use Embroidize designs to sell embroidered products?',
    a: 'Yes. All designs include a commercial use license. You can legally use them to create items for sale on Etsy, at markets, through your own shop, or for client orders — without paying additional licensing fees.',
  },
  {
    q: 'What embroidery file formats are included in each download?',
    a: 'Every download includes PES, DST, JEF, VP3, HUS, EXP, PCS, CND, and XXX — all in one ZIP file. This covers all major home and commercial embroidery machine brands.',
  },
  {
    q: 'Do I need to create an account to download designs?',
    a: 'Yes, a free account is required. Creating one takes less than a minute — just sign up with your email address. Your account saves your download history so you can re-download any design at any time.',
  },
  {
    q: 'How many free embroidery designs does Embroidize have?',
    a: 'Embroidize currently has over 15,000 free machine embroidery designs across florals, animals, kids, holiday, sports, fashion, home and living, and more. New designs are added regularly.',
  },
  {
    q: 'Are Embroidize designs suitable for beginners?',
    a: 'Yes. The library includes designs at all complexity levels — simple clean outlines ideal for beginners through to intricate detailed designs for experienced embroiderers.',
  },
];

// FAQPage structured data for rich results
const buildFaqJsonLd = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});

// Reusable check icon
function CheckIcon({ className = 'w-5 h-5 mr-3 text-black' }) {
  return (
    <svg
      className={className}
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
  );
}

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
  const [popularProducts, siteConfig] = await Promise.all([
    getPopularProducts('', 1, 12, { cache: 'no-store' }),
    getSiteConfig(),
  ]);
  const { products: allProducts } = popularProducts;

  const faqs = buildFaqs(
    siteConfig.freeDownloadLimit,
    windowPhrase(siteConfig.freeDownloadWindow)
  );

  return (
    <>
      {/* FAQ structured data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(faqs)) }}
      />

      {/* Navbar + Categories menu (client component — owns the toggle state) */}
      {/* <LandingHeader /> */}
      <Header />

      {/* Hero Section with Strong CTA */}
      <section className='relative w-full overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100'>
        <div className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20 pt-4 sm:pb-24 lg:pb-32'>
          <div className='text-center'>
            {/* Trust Badge */}
            <div className='inline-block mb-6 px-6 py-3 bg-green-400 text-black rounded-full text-base font-bold shadow-md'>
              ✓ 100% Free • No Credit Card Required • Instant Access
            </div>

            {/* Main Headline */}
            <h1
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
              className='text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6'
            >
              Download 18,000+ Free
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

            {/* Social Proof Numbers — single row on all screen sizes */}
            <div className='mt-6 pt-4 border-t border-gray-300'>
              <div className='flex flex-row flex-nowrap justify-center gap-6 sm:gap-12 max-w-2xl mx-auto'>
                <div className='text-center'>
                  <div className='text-3xl sm:text-5xl font-extrabold text-gray-900'>
                    18,000+
                  </div>
                  <div className='mt-2 text-sm sm:text-base text-gray-600 font-medium'>
                    Free Designs
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-3xl sm:text-5xl font-extrabold text-gray-900'>
                    12,000+
                  </div>
                  <div className='mt-2 text-sm sm:text-base text-gray-600 font-medium'>
                    Happy Users
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-3xl sm:text-5xl font-extrabold text-gray-900'>
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

      {/* NEW SECTION 1: Intro / value proposition */}
      <section className='py-16 bg-white'>
        <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-6'>
            Free machine embroidery designs — download instantly in any format
          </h2>
          <p className='text-lg text-gray-600 leading-relaxed mb-4'>
            Embroidize is a free machine embroidery designs platform built for
            hobbyists, small businesses, and professional embroiderers who want
            premium-quality files without the cost. Every design is
            professionally digitized, tested for clean stitching, and available
            in all major formats — completely free, forever.
          </p>
          <p className='text-lg text-gray-600 leading-relaxed'>
            All Embroidize designs include{' '}
            <span className='font-bold text-gray-900'>
              full commercial use rights
            </span>
            . You can use these designs to create and sell embroidered products
            on Etsy, at markets, or through your own business — without paying
            licensing fees or requesting permission.
          </p>
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

      {/* NEW SECTION 2: File formats table */}
      <section className='py-16 bg-gray-50'>
        <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-10'>
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900'>
              All major embroidery file formats included
            </h2>
            <p className='mt-4 text-lg text-gray-600'>
              Every design download includes a ZIP file with all formats — you
              never need to convert files or buy the same design twice.
            </p>
          </div>

          <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm'>
            <table className='w-full text-left'>
              <thead>
                <tr className='bg-black text-white'>
                  <th className='px-6 py-4 text-base font-bold'>Format</th>
                  <th className='px-6 py-4 text-base font-bold'>
                    Compatible machines
                  </th>
                </tr>
              </thead>
              <tbody>
                {FILE_FORMATS.map(({ format, machines }, i) => (
                  <tr
                    key={format}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className='px-6 py-4 font-bold text-gray-900'>
                      {format}
                    </td>
                    <td className='px-6 py-4 text-gray-600'>{machines}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className='my-12 flex flex-col sm:flex-row gap-4 justify-center items-center'>
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
          {allProducts?.length ? (
            <div className='container mx-auto px-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                <Suspense fallback={<LoadingSpinner />}>
                  {allProducts.map((item, index) => (
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

      {/* NEW SECTION 3: Browse by category */}
      <section className='py-16 bg-white'>
        <div className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-4'>
            Browse free machine embroidery designs by category
          </h2>
          <p className='text-lg text-gray-600 mb-10'>
            Our library covers every style and occasion. Browse by category to
            find exactly what your next project needs:
          </p>

          {/* Real categories from the API (same cache as the navbar menu) */}
          <CategoryPills />

          <div className='mt-8'>
            <Link
              href='/products'
              prefetch={false}
              className='inline-block px-6 py-3 rounded-full bg-black text-white font-bold hover:bg-gray-800 transition-colors'
            >
              View All Categories →
            </Link>
          </div>
        </div>
      </section>

      {/* NEW SECTION 4: Machine brand compatibility */}
      <section className='py-16 bg-gray-50'>
        <div className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-4'>
            Compatible with all major embroidery machine brands
          </h2>
          <p className='text-lg text-gray-600 mb-10'>
            Because every design includes all file formats in one download, you
            never need to worry about compatibility:
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
            {MACHINE_BRANDS.map((brand) => (
              <div
                key={brand}
                className='flex items-center justify-center px-4 py-4 rounded-xl bg-white border border-gray-200 font-bold text-gray-800 text-sm sm:text-base'
              >
                <CheckIcon className='w-4 h-4 mr-2 text-black shrink-0' />
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className='py-14 bg-white'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl sm:text-4xl font-bold text-gray-900'>
              How It Works
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'>
            {[
              {
                title: 'Create Free Account',
                text: 'Sign up free with your email',
              },
              {
                title: 'Browse 15k+ Designs',
                text: 'Find the perfect embroidery file',
              },
              {
                title: 'Download Instantly',
                text: 'Get your files immediately',
              },
            ].map(({ title, text }) => (
              <div
                key={title}
                className='bg-gray-50 p-6 text-center rounded-md'
              >
                <div className='w-12 h-12 mx-auto mb-4 bg-black rounded-full flex items-center justify-center'>
                  <CheckIcon className='w-6 h-6 text-white' />
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-2'>
                  {title}
                </h3>
                <div className='flex items-center justify-center text-gray-700 text-base font-semibold'>
                  <CheckIcon className='w-4 h-4 mr-2 text-black' />
                  {text}
                </div>
              </div>
            ))}
          </div>

          {/* Trusted Section */}
          <div className='text-center my-8'>
            <h3 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-6'>
              Trusted by Embroidery Lovers Worldwide
            </h3>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-10 max-w-3xl mx-auto text-left'>
              {[
                '15,000+ Designs Available',
                'Free for Personal & Commercial Use',
                'New Designs Added Daily',
                'Secure & Fast Access',
              ].map((item) => (
                <div
                  key={item}
                  className='flex items-center font-bold text-gray-800 text-lg'
                >
                  <CheckIcon />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION 5: Why thousands choose Embroidize */}
      <section className='py-16 bg-gray-50'>
        <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-6'>
            Why thousands of embroiderers choose Embroidize
          </h2>
          <p className='text-lg text-gray-600 leading-relaxed mb-4'>
            Most &quot;free&quot; embroidery design sites come with hidden
            limits — personal-use-only licenses, low digitizing quality, or
            designs locked behind a subscription paywall. Embroidize is
            different.
          </p>
          <p className='text-lg text-gray-600 leading-relaxed'>
            Our library of 15,000+ free machine embroidery designs is
            professionally digitized to the same standard as paid platforms —
            clean stitching, accurate color sequences, optimized pathing. Every
            file is tested before publishing. And unlike most free embroidery
            sites, every design includes{' '}
            <span className='font-bold text-gray-900'>
              full commercial use rights
            </span>
            .
          </p>
        </div>
      </section>

      {/* NEW SECTION 6: FAQ */}
      <section className='py-16 bg-white'>
        <div className='mx-auto max-w-3xl px-4 sm:px-6 lg:px-8'>
          <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12'>
            Frequently asked questions
          </h2>

          <div className='space-y-4'>
            {faqs.map(({ q, a }) => (
              <details
                key={q}
                className='group rounded-2xl border border-gray-200 bg-gray-50 px-6 py-4'
              >
                <summary className='flex cursor-pointer items-center justify-between text-lg font-bold text-gray-900 list-none'>
                  {q}
                  <span className='ml-4 shrink-0 text-2xl text-gray-400 transition-transform group-open:rotate-45'>
                    +
                  </span>
                </summary>
                <p className='mt-3 text-gray-600 leading-relaxed'>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section — updated copy */}
      <section className='bg-gradient-to-br from-gray-800 via-gray-600 to-gray-800 py-16 sm:py-20'>
        <div className='mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2'>
            Start downloading free machine embroidery designs today
          </h2>

          <p className='text-base sm:text-lg text-white mb-6'>
            Join thousands of embroiderers and small business owners who use
            Embroidize as their go-to source for free, commercially licensed
            designs. Create your free account in under a minute.
          </p>

          <Link
            href='/auth/register'
            className='inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto'
          >
            Create Free Account →
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
