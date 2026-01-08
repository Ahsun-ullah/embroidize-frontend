import BlogCard from '@/components/Common/BlogCard';
import Pagination from '@/components/Common/Pagination';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getBlogs } from '@/lib/apis/public/blog';

export const revalidate = 0;

export const metadata = {
  title: 'Blog | Machine Embroidery Tips & Design Ideas',
  description:
    'Explore the world of machine embroidery! Get expert tips, trending designs, and creative inspiration for your next embroidery projects.',
  alternates: {
    canonical: 'https://embroidize.com/blog',
  },
  openGraph: {
    title: 'Blog | Machine Embroidery Tips & Design Ideas',
    description:
      'Explore the world of machine embroidery! Get expert tips, trending designs, and creative inspiration for your next embroidery projects.',
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
    title: 'Blog | Machine Embroidery Tips & Design Ideas',
    description:
      'Explore the world of machine embroidery! Get expert tips, trending designs, and creative inspiration for your next embroidery projects.',
    images: ['https://embroidize.com/og-banner.jpg'],
  },
};

export default async function AllBlogsPageInFrontSite({ searchParams }) {
  const { blogs } = await getBlogs();

  const currentPage = parseInt(searchParams?.page || '1', 10);
  const perPageData = 6;
  const totalPages = Math.ceil(blogs.length / perPageData);

  const startIndex = (currentPage - 1) * perPageData;
  const endIndex = startIndex + perPageData;
  const paginatedBlogs = blogs.slice(startIndex, endIndex);

  return (
    <>
      <Header />

      <h1 className='text-center text-3xl font-bold my-8'>
        Explore the latest embroidery design tutorials, tips.
      </h1>

      {paginatedBlogs.length > 0 && (
        <>
          <section className='text-black my-8 py-6'>
            <div className='container mx-auto px-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
                {paginatedBlogs.map((item, index) => (
                  <BlogCard key={index} data={item} />
                ))}
              </div>
            </div>
          </section>
          <div className='flex items-center justify-center my-6'>
            <Pagination totalPages={totalPages} perPage={perPageData} />
          </div>
        </>
      )}
      <Footer />
    </>
  );
}
