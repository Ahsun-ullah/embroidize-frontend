import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import AllCategoriesGrid from './AllCategoriesGrid';

// SEO
export const metadata = {
  title: 'Browse All Categories - Embroidize',
  description:
    'Explore our wide range of premium embroidery design categories. Find the perfect machine embroidery design for every project, style and occasion.',
  alternates: { canonical: 'https://embroidize.com/categories' },
  openGraph: {
    title: 'Browse All Categories - Embroidize',
    description:
      'Explore our wide range of premium embroidery design categories. Find the perfect design for every project, style and occasion.',
    url: 'https://embroidize.com/categories',
    siteName: 'Embroidize',
    type: 'website',
  },
};

export default function CategoriesPage() {
  return (
    <div className='min-h-screen bg-[#f7f7f7]'>
      {/* Your own header */}
      <Header />

      {/* ───────── HERO ───────── */}
      <section className=' relative overflow-hidden bg-[#ffffff]'>
        {/* Banner image (right side) — replace src with your own image */}
        <div className='pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] md:block lg:w-[55%]'>
          <Image
            src='/an_embroidery_hoop_with_a_meticulously.jpg'
            alt='Embroidery design showcase'
            fill
            priority
            sizes='(min-width: 1024px) 48vw, 55vw'
            className='object-cover'
          />

        </div>

        <div className='container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20'>
          <div className='max-w-xl'>
            {/* Breadcrumb */}
            <nav
              aria-label='Breadcrumb'
              className='mb-5 flex items-center gap-1.5 text-sm text-neutral-500'
            >
              <Link href='/' className='transition hover:text-neutral-800'>
                Home
              </Link>
              <ChevronRight className='h-3.5 w-3.5' aria-hidden />
              <span className='font-medium text-gray-700'>Categories</span>
            </nav>

            {/* Heading */}
            <h1
              style={{ fontFamily: 'Georgia, serif' }}
              className='text-4xl sm:text-5xl font-bold tracking-tight text-[#0f1b34]'
            >
              Browse All Categories
            </h1>

            {/* Coral squiggle */}
            <svg
              className='mt-3 h-3 w-24 text-rose-500'
              viewBox='0 0 120 14'
              fill='none'
              aria-hidden
            >
              <path
                d='M2 8 C 14 2, 26 2, 38 7 S 62 13, 74 7 S 98 2, 118 6'
                stroke='currentColor'
                strokeWidth='3.5'
                strokeLinecap='round'
              />
            </svg>

            {/* Description */}
            <p className='mt-5 max-w-md text-base leading-relaxed text-neutral-500'>
              Explore our wide range of premium embroidery design categories.
              Find the perfect design for every project, style and occasion.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── CATEGORY GRID ───────── */}
      <AllCategoriesGrid />

      <Footer />
    </div>
  );
}
