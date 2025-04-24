// app/blog/[slug]/page.tsx
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getSingleBlog } from '@/lib/apis/public/blog';
import { marked } from 'marked';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ searchParams }) {
  const blogData = await getSingleBlog(searchParams.id);
  const blog = blogData?.blogs;

  if (!blog) return {};

  return {
    title: blog?.meta_title || blog?.title,
    description: blog?.meta_description,
    openGraph: {
      title: blog?.meta_title || blog?.title,
      description: blog?.meta_description,
      images: [
        {
          url: blog?.image?.url || 'https://embro-id.vercel.app/og-banner.jpg',
          width: 1200,
          height: 630,
          alt: blog?.title || 'Embroidery Design',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog?.meta_title || blog?.title,
      description: blog?.meta_description || blog?.description,
      images: [
        blog?.image?.url || 'https://embro-id.vercel.app/home-banner.jpg',
      ],
    },
  };
}

export default async function SingleBlogPage({ searchParams }) {
  const blogData = await getSingleBlog(searchParams.id);
  const blog = blogData?.blogs;

  if (!blog) return notFound();

  const rawMarkup = marked(blog?.description || '');

  return (
    <>
      <Header />

      <div className='container prose prose-lg mx-auto py-12'>
        <button className='mb-6'>
          <Link href='/blog' className='button'>
            ← Back to Blog
          </Link>
        </button>

        <div className='w-full aspect-[16/9] relative mb-6 rounded-lg shadow overflow-hidden'>
          <Image
            src={blog.image?.url || '/images.jpg'}
            alt={blog.title}
            fill
            className='object-cover'
            priority
          />
        </div>

        <h1 className='text-4xl font-bold mb-2'>{blog.title}</h1>
        <p className='text-sm text-gray-500 mb-6'>
          By{' '}
          {new Date(blog.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        <pre
          dangerouslySetInnerHTML={{ __html: rawMarkup }}
          className='prose max-w-none break-words whitespace-pre-wrap font-sans text-lg'
        />
      </div>

      <Footer />
    </>
  );
}
