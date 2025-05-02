import BlogSection from '@/components/user/HomePage/BlogSection';
import Footer from '@/components/user/HomePage/Footer';
import { Header } from '@/components/user/HomePage/Header';
import HeroSection from '@/components/user/HomePage/HeroSection';
import PopularDesign from '@/components/user/HomePage/PopularDesign';
import RecentProductsSection from '@/components/user/HomePage/RecentProductsSection';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Free Machine Embroidery Designs - Embroidize',
  description:
    'Download free embroidery designs instantly – Browse unlimited machine embroidery Design in multiple categories and styles. All designs are tested and come in the most popular formats',
  keywords: [
    'free embroidery machine designs',
    'Embroidery design',
    'Machine embroidery designs',
    'machine embroidery file',
    'Machine embroidery patterns',
    'free embroidery files',
  ],
  openGraph: {
    title: 'Free Machine Embroidery Designs - Embroidize',
    description:
      'Download free embroidery designs instantly – Browse unlimited machine embroidery Design in multiple categories and styles. All designs are tested and come in the most popular formats',
    url: 'https://embroidize.com/',
    siteName: 'Embroid',
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
      'Download free embroidery designs instantly – Browse unlimited machine embroidery Design in multiple categories and styles. All designs are tested and come in the most popular formats.',
    images: ['https://embroidize.com/og-banner.jpg'],
  },
};

export default function Home() {
  return (
    <>
      <Header />
      {/* Hero Section */}
      <HeroSection />
      {/* For Category section */}
      {/* <CategorySection /> */}
      {/* For Popular Embroidery Designs */}
      <PopularDesign />
      {/* Recent Approved Products */}
      <RecentProductsSection />
      {/* for Blog  Part  */}
      <BlogSection />
      <div className='flex justify-center items-center my-10'>
        <Link
          href={'/blog'}
          className='bg-black rounded-full hover:bg-blue-400 text-white font-medium px-6 py-2'
        >
          View All
        </Link>
      </div>
      {/* FAq section */}
      {/* <FaqSection /> */}
      {/* subscribe search  */}
      {/* <SubscribeSearchSection /> */}
      {/* footer */}
      <Footer />
    </>
  );
}
