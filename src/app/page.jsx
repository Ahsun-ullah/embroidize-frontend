import LoadingSpinner from '@/components/Common/LoadingSpinner';
import BlogSection from '@/components/user/HomePage/BlogSection';
import Footer from '@/components/user/HomePage/Footer';
import { Header } from '@/components/user/HomePage/Header';
import HeroSection from '@/components/user/HomePage/HeroSection';
import PopularDesign from '@/components/user/HomePage/PopularDesign';
import RecentProductsSection from '@/components/user/HomePage/RecentProductsSection';
import { getBlogs } from '@/lib/apis/public/blog';
import Link from 'next/link';
import { Suspense, use } from 'react';
import ProductUpdates from './products/ProductUpdates';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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

export default function Home() {
  const { blogs } = use(getBlogs('', 1, 3));

  return (
    <>
      <ProductUpdates />

      <Header />
      <HeroSection />

      <section className='bg-blue-50 text-black my-8 py-6'>
        <div className='flex items-center justify-center'>
          <h4
            id='popular-designs-heading'
            className='text-3xl font-bold text-center'
          >
            Popular embroidery designs
          </h4>
        </div>
        <div className='flex items-center justify-center mt-4'>
          <h4 className='font-semibold text-center'>
            Browse Our Most Loved Designs.
          </h4>
        </div>
      </section>
      <PopularDesign />

      <section className='bg-blue-50 text-black my-8 py-6'>
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
      </section>
      <RecentProductsSection />

      {blogs && blogs?.length > 0 && (
        <>
          <section className='bg-blue-50 text-black my-8 py-6'>
            <div className='flex items-center justify-center'>
              <h4 className='text-3xl font-bold'>Latest From Blog</h4>
            </div>
            <div className='flex items-center justify-center mt-4'>
              <p className='font-bold text-lg text-center'>
                Tips, Trends & Tutorials You’ll Love
              </p>
            </div>
          </section>
          <Suspense fallback={<LoadingSpinner />}>
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
