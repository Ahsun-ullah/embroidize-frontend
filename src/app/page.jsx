import CategorySelect from '@/components/Common/CategorySelect';
import BlogSection from '@/components/user/HomePage/BlogSection';
import Footer from '@/components/user/HomePage/Footer';
import { Header } from '@/components/user/HomePage/Header';
import HeroSection from '@/components/user/HomePage/HeroSection';
import PopularDesign from '@/components/user/HomePage/PopularDesign';
import RecentProductsSection from '@/components/user/HomePage/RecentProductsSection';
import { Divider } from '@heroui/react';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <>
      <Header />
      <Divider />
      <div className='text-black h-12 flex items-center justify-center bg-white'>
        <div>
          <CategorySelect />
        </div>
      </div>
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
