"use client ";
import CategorySection from "@/components/HomePage/CategorySection";
import Header from "@/components/HomePage/Header";
import HeroSection from "@/components/HomePage/HeroSection";
export default function Home() {
  return (
    <>
      <Header />
      {/* Hero Section */}
      <HeroSection />
      {/* For Category section */}
      <CategorySection />
    </>
  );
}
