import BlogCard from '@/components/Common/BlogCard';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getBlogs } from '@/lib/apis/public/blog';
import { use } from 'react';

export const metadata = {
  title: 'Blog | Embroidize',
  description:
    'Explore the latest embroidery design tutorials, tips, and updates from the Embro ID team.',
  openGraph: {
    title: 'Blog | Embro ID',
    description:
      'Explore the latest embroidery design tutorials, tips, and updates from the Embro ID team.',
    url: 'https://embro-id.vercel.app/blog',
    type: 'website',
    images: [
      {
        url: 'https://embro-id.vercel.app/og-banner.jpg',
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
    images: ['https://embro-id.vercel.app/og-banner.jpg'],
  },
};

export default function AllBlogsPageInFrontSite() {
  const { blogs } = use(getBlogs());

  console.log(blogs);
  return (
    <div>
      <Header />

      <section className='text-black my-8 py-6'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
            {blogs.map((item, index) => (
              <BlogCard key={item?._id} data={item} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
