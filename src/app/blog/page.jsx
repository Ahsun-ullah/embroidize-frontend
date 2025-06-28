import Pagination from '@/components/Common/Pagination';
import BlogSection from '@/components/user/HomePage/BlogSection';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getBlogs } from '@/lib/apis/public/blog';
import { use } from 'react';
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blog | Embroidize',
  description:
    'Explore the latest embroidery design tutorials, tips, and updates from the Embro ID team.',
  alternates: {
    canonical: 'https://embroidize.com/blog',
  },
  openGraph: {
    title: 'Blog | Embro ID',
    description:
      'Explore the latest embroidery design tutorials, tips, and updates from the Embro ID team.',
    url: 'https://embroidize.com/blog',
    type: 'website',
    images: [
      {
        url: 'https://embroidize.com/og-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Embro ID Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Embro ID',
    description:
      'Explore the latest embroidery design tutorials, tips, and updates from the Embro ID team.',
    images: ['https://embroidize.com/og-banner.jpg'],
  },
};

export default function AllBlogsPageInFrontSite(searchParams) {
  const currentPage = parseInt(searchParams?.page) || 1;
  const perPageData = parseInt(searchParams?.limit) || 10;
  const { blogs, totalPages } = use(getBlogs('', currentPage, perPageData));

  return (
    <>
      <Header />
      <BlogSection blogs={blogs} />
      {blogs.length > 0 && (
        <div className='flex items-center justify-center my-6'>
          <Pagination
            currentPage={currentPage?.page}
            perPageData={perPageData}
            totalPages={totalPages}
          />
        </div>
      )}
      <Footer />
    </>
  );
}
