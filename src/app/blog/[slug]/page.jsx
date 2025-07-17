import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getSingleBlog } from '@/lib/apis/public/blog';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const blogData = await getSingleBlog(params?.slug);
  const blog = blogData?.blogs;

  if (!blog) return {};

  return {
    title: blog?.meta_title,
    description: blog?.meta_description,
    alternatives: {
      canonical: `https://embroidize.com/blog/${blog.slug}`,
    },
    keywords: blog?.meta_keywords,
    openGraph: {
      title: blog?.meta_title,
      description: blog?.meta_description,
      images: [
        {
          url: blog?.image?.url || 'https://embroidize.com/og-banner.jpg',
          width: 1200,
          height: 630,
          alt: blog?.title || 'Embroidery Design',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog?.meta_title,
      description: blog?.meta_description,
      images: [blog?.image?.url || 'https://embroidize.com/og-banner.jpg'],
    },
  };
}

export default async function SingleBlogPage({ params }) {
  const blogData = await getSingleBlog(params.slug);
  const blog = blogData?.blogs;

  if (!blog) return notFound();

  return (
    <>
      <Header />

      <div className='container mx-auto px-4 py-12 max-w-5xl'>
        <Link
          href='/blog'
          className='button inline-block mb-6 text-base font-medium'
        >
          ← Back to Blog
        </Link>

        {/* Blog Cover Image */}
        <div className='relative w-full aspect-[16/9] mb-6 rounded-lg overflow-hidden shadow-md'>
          <Image
            src={blog?.image?.url || 'https://embroidize.com/og-banner.jpg'}
            alt={blog?.title}
            fill
            className='object-fill'
            priority
            sizes='(max-width: 768px) 100vw, 700px'
          />
        </div>

        {/* Blog Title */}
        <h1 className='text-4xl font-bold mb-2 leading-tight'>{blog?.title}</h1>

        {/* Blog Date */}
        <p className='text-sm text-gray-500 mb-6'>
          {new Date(blog?.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        <div
          className='prose max-w-none'
          dangerouslySetInnerHTML={{ __html: blog?.description }}
        />
      </div>

      <Footer />
    </>
  );
}
