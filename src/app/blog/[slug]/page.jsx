import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getSingleBlog } from '@/lib/apis/public/blog';
import { Divider } from '@heroui/divider';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import BlogPageSidebarContent from '../BlogPageSidebarContent';

export async function generateMetadata({ params }) {
  const slugData = params.slug;
  const blogData = await getSingleBlog(slugData);
  const blog = blogData?.blogs;
  // const blog = await getPostBySlug(slugData);

  if (!blog) return {};

  return {
    title: blog?.title,
    // blog?.title?.rendered
    description:
      blog?.meta_description ||
      'Explore the latest embroidery design tutorials, tips, and updates from the Embroidize team.',
    alternates: {
      canonical: `https://embroidize.com/blog/${blog.slug}`,
    },
    keywords: blog?.meta_keywords?.join(', '),
    // blog?.tags?.join(', ')
    openGraph: {
      title: blog?.title,
      // blog?.title?.rendered
      description: blog?.meta_description,
      images: [
        {
          url: blog?.image?.url,
          // blog?.featuredImage
          width: 1200,
          height: 630,
          alt: blog?.title,
          // blog?.title?.rendered || 'Embroidery Design'
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog?.title,
      // blog?.title?.rendered
      description: blog?.meta_description,
      images: [
        blog?.image?.url,
        // blog?.featuredImage || 'https://embroidize.com/og-banner.jpg'
      ],
    },
  };
}

export default async function SingleBlogPage({ params }) {
  // const blog = await getPostBySlug(params.slug);
  const slugData = params.slug;
  const blogData = await getSingleBlog(slugData);
  const blog = blogData?.blogs;
  if (!blog) return notFound();

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://embroidize.com/blog/${blog.slug}`,
    },
    headline: blog?.title,
    // blog?.title?.rendered

    description:
      blog?.meta_description ||
      'Explore the latest embroidery design tutorials, tips, and updates from the Embroidize team.',
    image: blog?.image?.url,
    // blog?.featuredImage || 'https://embroidize.com/og-banner.jpg'
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
    datePublished: blog?.createdAt,
    // blog?.date

    dateModified: blog?.updatedAt,
    // blog?.modified || blog?.date
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
            prefetch={false}
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
            <figure className='relative w-full aspect-[3/2] mb-12 rounded-lg overflow-hidden shadow-md'>
              <Image
                src={
                  blog?.image?.url
                  // blog?.featuredImage || 'https://embroidize.com/og-banner.jpg'
                }
                alt={
                  blog?.title
                  // blog?.title?.rendered || 'Embroidery Design'
                }
                fill
                className=''
                priority
                sizes='(max-width: 768px) 100vw, 700px'
                itemProp='image'
              />
            </figure>

            <div className='rounded-lg overflow-hidden shadow-xl p-8'>
              <header className='mb-6'>
                <h1 className='text-4xl font-bold mb-2' itemProp='headline'>
                  {
                    blog?.title
                    // blog?.title?.rendered
                  }
                </h1>
                <time
                  className='block text-gray-600 text-sm'
                  dateTime={
                    blog?.createdAt
                    // blog?.date
                  }
                  itemProp='datePublished'
                >
                  {new Date(blog?.createdAt).toISOString().split('T')[0]}
                </time>

                {blog?.meta_keywords?.length >
                  //  blog?.tags?.length
                  0 && (
                  <div className='flex flex-wrap gap-2 mt-4'>
                    {blog?.meta_keywords
                      // blog.tags.
                      .map((tag) => (
                        <Link
                          key={tag}
                          href={`/search?searchQuery=${tag.split(' ').join('+')}`}
                          prefetch={false}
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
                className='custom-blog-content '
                style={{ fontSize: 18 }}
                dangerouslySetInnerHTML={{
                  __html: blog?.description,
                  // blog?.content?.rendered
                }}
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
