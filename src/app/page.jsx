import BlogSection from '@/components/user/HomePage/BlogSection';
import Footer from '@/components/user/HomePage/Footer';
import { Header } from '@/components/user/HomePage/Header';
import HeroSection from '@/components/user/HomePage/HeroSection';
import PopularDesign from '@/components/user/HomePage/PopularDesign';
import RecentProductsSection from '@/components/user/HomePage/RecentProductsSection';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Free Embroidery Machine Designs - Download High-Quality Patterns',
  description:
    'Download free embroidery machine designs with high-quality patterns for various fabric types. Get creative with our exclusive free collection of embroidery designs.',
  keywords: [
    'free embroidery machine designs',
    'free embroidery patterns',
    'download embroidery designs',
    'machine embroidery designs',
    'embroidery patterns',
    'free embroidery files',
  ],
  openGraph: {
    title: 'Free Embroidery Machine Designs - Download High-Quality Patterns',
    description:
      'Download free embroidery machine designs with high-quality patterns for various fabric types.',
    url: 'https://embro-id.vercel.app/',
    siteName: 'Your Site Name',
    images: [
      {
        url: 'https://embro-id.vercel.app/og-banner.jpg',
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
      'Download free embroidery machine designs with high-quality patterns.',
    images: ['https://embro-id.vercel.app/home-banner.jpg'],
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
      {/* FAq section */}
      {/* <FaqSection /> */}
      {/* subscribe search  */}
      {/* <SubscribeSearchSection /> */}
      {/* footer */}
      <Footer />
    </>
  );
}
