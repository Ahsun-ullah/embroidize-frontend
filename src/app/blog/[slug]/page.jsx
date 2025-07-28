import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getPostBySlug } from '@/lib/wordpress';
import { Divider } from '@heroui/divider';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogPageSidebarContent from '../BlogPageSidebarContent';

export async function generateMetadata({ params }) {
  const blog = await getPostBySlug(params?.slug);

  if (!blog) return {};

  const description =
    blog?.meta_description ||
    'Explore the latest embroidery design tutorials, tips, and updates from the Embroidize team.';

  return {
    title: blog?.title?.rendered,
    description,
    alternates: {
      canonical: `https://embroidize.com/blog/${blog.slug}`,
    },
    keywords: blog?.tags?.join(', '),
    openGraph: {
      title: blog?.title?.rendered,
      description,
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
      description,
      images: [blog?.featuredImage || 'https://embroidize.com/og-banner.jpg'],
    },
  };
}

export default async function SingleBlogPage({ params }) {
  const blog = await getPostBySlug(params.slug);

  if (!blog) return notFound();

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://embroidize.com/blog/${blog.slug}`,
    },
    headline: blog?.title?.rendered,
    description:
      blog?.meta_description ||
      'Explore the latest embroidery design tutorials, tips, and updates from the Embroidize team.',
    image: blog?.featuredImage || 'https://embroidize.com/og-banner.jpg',
    author: {
      '@type': 'Organization',
      name: 'Embroidize',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Embroidize',
      logo: {
        '@type': 'ImageObject',
        url: 'https://embroidize.com/logo.png',
      },
    },
    datePublished: blog?.date,
    dateModified: blog?.modified || blog?.date,
  };

  return (
    <>
      <Header />
      <main className='container mx-auto py-8'>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <nav className='mb-6'>
          <Link
            href='/blog'
            className='button inline-block text-base font-medium hover:underline'
            aria-label='Back to Blog'
          >
            ← Back to Blog
          </Link>
        </nav>

        <div className='flex flex-col lg:flex-row justify-between items-start gap-10'>
          <article
            className='flex-1'
            itemScope
            itemType='https://schema.org/Article'
          >
            <figure className='relative w-full aspect-[16/9] mb-12 rounded-lg overflow-hidden shadow-md'>
              <Image
                src={
                  blog?.featuredImage || 'https://embroidize.com/og-banner.jpg'
                }
                alt={blog?.title?.rendered || 'Embroidery Design'}
                fill
                className='object-cover'
                priority
                sizes='(max-width: 768px) 100vw, 700px'
                itemProp='image'
              />
            </figure>

            <div className='rounded-lg overflow-hidden shadow-xl p-8'>
              <header className='mb-6'>
                <h1 className='text-4xl font-bold mb-2' itemProp='headline'>
                  {blog?.title?.rendered}
                </h1>
                <time
                  className='block text-gray-600 text-sm'
                  dateTime={blog?.date}
                  itemProp='datePublished'
                >
                  {new Date(blog?.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>

                {blog?.tags?.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-4'>
                    {blog.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/search?searchQuery=${encodeURIComponent(tag)}`}
                        className='inline-block bg-gray-100 px-3 py-1 text-xs rounded-full text-gray-700 hover:bg-primary hover:text-white transition'
                        aria-label={`View posts tagged with ${tag}`}
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </header>

              <section
                className='prose max-w-none leading-relaxed text-justify'
                style={{ fontSize: 18 }}
                dangerouslySetInnerHTML={{ __html: blog?.content?.rendered }}
                itemProp='articleBody'
              />
            </div>
          </article>

          <Divider
            orientation='vertical'
            className='bg-gray-300 h-96 hidden lg:block self-stretch'
          />

          <BlogPageSidebarContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
