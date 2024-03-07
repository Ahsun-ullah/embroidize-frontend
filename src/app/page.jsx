"use client ";
import BlogSection from "@/components/HomePage/BlogSection";
import CategorySection from "@/components/HomePage/CategorySection";
import FaqSection from "@/components/HomePage/FaqSection";
import Footer from "@/components/HomePage/Footer";
import Header from "@/components/HomePage/Header";
import HeroSection from "@/components/HomePage/HeroSection";
import PopularDesign from "@/components/HomePage/PopularDesign";
import RecentProductsSection from "@/components/HomePage/RecentProductsSection";
import SubscribeSearchSection from "@/components/HomePage/SubscribeSearchSection";
export default function Home() {
  return (
    <>
      <Header />
      {/* Hero Section */}
      <HeroSection />
      {/* For Category section */}
      <CategorySection />
      {/* For Popular Embroidery Designs */}
      <PopularDesign />
      {/* Recent Approved Products */}
      <RecentProductsSection />
      {/* for Blog  Part  */}
      <BlogSection />
      {/* FAq section */}
      <FaqSection />
      {/* subscribe search  */}
      <SubscribeSearchSection />
      {/* footer */}
      <Footer />
    </>
  );
}
