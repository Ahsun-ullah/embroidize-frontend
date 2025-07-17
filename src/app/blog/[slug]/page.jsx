import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getSingleBlog } from '@/lib/apis/public/blog';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import 'quill/dist/quill.snow.css';

export async function generateMetadata({ params }) {
  const blogData = await getSingleBlog(params?.slug);
  const blog = blogData?.blogs;

  if (!blog) return {};

  return {
    title: blog?.meta_title,
    description: blog?.meta_description,
    alternates: {
      canonical: `https://embroidize.com/blog/${blog.slug}`,
    },
    keywords: blog?.meta_keywords?.join(', '),
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
      <main>
        <div className='container mx-auto px-4 py-12 max-w-5xl'>
          <nav>
            <Link
              href='/blog'
              className='button inline-block mb-6 text-base font-medium'
              aria-label='Back to Blog'
            >
              ← Back to Blog
            </Link>
          </nav>
          <article>
            {/* Blog Cover Image */}
            <figure className='relative w-full aspect-[16/9] mb-6 rounded-lg overflow-hidden shadow-md'>
              <Image
                src={blog?.image?.url || 'https://embroidize.com/og-banner.jpg'}
                alt={blog?.title}
                fill
                className='object-fill'
                priority
                sizes='(max-width: 768px) 100vw, 700px'
              />
            </figure>
            <header>
              <h1 className='text-4xl font-bold mb-2 leading-tight'>
                {blog?.title}
              </h1>
              <time
                className='text-sm text-gray-500 mb-6 block'
                dateTime={blog?.createdAt}
                suppressHydrationWarning
              >
                {new Date(blog?.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              {/* Render tags if available */}
              {blog?.meta_keywords?.length > 0 && (
                <div className='flex flex-wrap gap-2 mb-6'>
                  {blog.meta_keywords.map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?searchQuery=${tag.split(' ').join('+')}`}
                      className='inline-block bg-gray-100 px-3 py-1 text-xs rounded-full text-gray-700 hover:bg-primary hover:text-white transition'
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </header>
            {/* Rich text blog description */}
            <div
              className='ql-editor max-w-none'
              style={{ padding: 0, fontSize: 18 }}
              dangerouslySetInnerHTML={{ __html: blog?.description }}
            />
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
