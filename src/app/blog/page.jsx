import Pagination from '@/components/Common/Pagination';
import BlogSection from '@/components/user/HomePage/BlogSection';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getPosts } from '@/lib/wordpress';

export const revalidate = 0;

export const metadata = {
  title: 'Blog | Embroidize',
  description:
    'Explore the latest embroidery design tutorials, tips, and updates from the Embroidize team.',
  alternates: {
    canonical: 'https://embroidize.com/blog',
  },
  openGraph: {
    title: 'Blog | Embroidize',
    description:
      'Explore the latest embroidery design tutorials, tips, and updates from the Embroidize team.',
    url: 'https://embroidize.com/blog',
    type: 'website',
    images: [
      {
        url: 'https://embroidize.com/og-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Embroidize Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Embroidize',
    description:
      'Explore the latest embroidery design tutorials, tips, and updates from the Embroidize team.',
    images: ['https://embroidize.com/og-banner.jpg'],
  },
};

export default async function AllBlogsPageInFrontSite({ searchParams }) {
  const blogs = await getPosts();

  return (
    <>
      <Header />
      <BlogSection blogs={blogs} />

      {blogs.length > 0 && (
        <div className='flex items-center justify-center my-6'>
          <Pagination
            currentPage={searchParams?.page || 1}
            perPageData={6}
            totalPages={Math.ceil(blogs.length / 6)}
          />
        </div>
      )}

      <Footer />
    </>
  );
}
