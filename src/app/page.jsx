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
      <Suspense fallback={<LoadingSpinner />}>
        <ProductUpdates />
      </Suspense>

      <Header />
      <HeroSection />

      <section aria-labelledby='popular-designs-heading'>
        <h2 id='popular-designs-heading' className='sr-only'>
          Popular Designs
        </h2>
        <Suspense fallback={<LoadingSpinner />}>
          <PopularDesign />
        </Suspense>
      </section>

      <section aria-labelledby='recent-products-heading'>
        <h2 id='recent-products-heading' className='sr-only'>
          Recent Products
        </h2>
        <Suspense fallback={<LoadingSpinner />}>
          <RecentProductsSection />
        </Suspense>
      </section>

      <section aria-labelledby='blog-section-heading'>
        <h2 id='blog-section-heading' className='sr-only'>
          Latest Blog Posts
        </h2>
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
      </section>

      <Suspense fallback={<LoadingSpinner />}>
        <Footer />
      </Suspense>
    </>
  );
}
