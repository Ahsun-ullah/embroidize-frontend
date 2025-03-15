"use client";

import { Header } from "@/components/user/HomePage/Header";
import BlogSection from "../components/user/HomePage/BlogSection";
import CategorySection from "../components/user/HomePage/CategorySection";
import Footer from "../components/user/HomePage/Footer";
import HeroSection from "../components/user/HomePage/HeroSection";
import PopularDesign from "../components/user/HomePage/PopularDesign";
import RecentProductsSection from "../components/user/HomePage/RecentProductsSection";
import SubscribeSearchSection from "../components/user/HomePage/SubscribeSearchSection";

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
      {/* <FaqSection /> */}
      {/* subscribe search  */}
      <SubscribeSearchSection />
      {/* footer */}
      <Footer />
    </>
  );
}
