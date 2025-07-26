import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getPostBySlug } from '@/lib/wordpress';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const blog = await getPostBySlug(params?.slug);

  if (!blog) return {};

  return {
    title: blog?.title?.rendered,
    description:
      blog?.meta_description ||
      'Explore the latest embroidery design tutorials, tips, and updates from the Embroidize team.',
    alternates: {
      canonical: `https://embroidize.com/blog/${blog.slug}`,
    },
    keywords: blog?.tags?.join(', '),
    openGraph: {
      title: blog?.title?.rendered,
      description:
        blog?.meta_description ||
        'Explore the latest embroidery design tutorials, tips, and updates from the Embroidize team.',
      images: [
        {
          url: blog?.featuredImage || 'https://embroidize.com/og-banner.jpg',
          width: 1200,
          height: 630,
          alt: blog?.title?.rendered || 'Embroidery Design',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog?.title?.rendered,
      description:
        blog?.meta_description ||
        'Explore the latest embroidery design tutorials, tips, and updates from the Embroidize team.',
      images: [blog?.featuredImage || 'https://embroidize.com/og-banner.jpg'],
    },
  };
}

export default async function SingleBlogPage({ params }) {
  const blogData = await getPostBySlug(params.slug);
  const blog = blogData;

  if (!blog) return notFound();

  return (
    <>
      <Header />
      <main>
        <div className='container mx-auto py-10'>
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
                src={
                  blog?.featuredImage || 'https://embroidize.com/og-banner.jpg'
                }
                alt={blog?.title?.rendered}
                fill
                className='object-fill'
                priority
                sizes='(max-width: 768px) 100vw, 700px'
              />
            </figure>

            <header>
              <h1 className='text-4xl font-bold mb-2'>
                {blog?.title?.rendered}
              </h1>
              <time
                style={{ padding: 0, fontSize: 18 }}
                className='mb-6 block'
                dateTime={blog?.date}
                suppressHydrationWarning
              >
                {new Date(blog?.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              {/* Render tags if available */}
              {blog?.tags?.length > 0 && (
                <div className='flex flex-wrap gap-2 mb-6'>
                  {blog.tags.map((tag) => (
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
              className='prose max-w-none'
              style={{ padding: 0, fontSize: 18 }}
              dangerouslySetInnerHTML={{ __html: blog?.content?.rendered }}
            />
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
