import ShareButtons from '@/components/Common/ShareButtons';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getSingleBlog } from '@/lib/apis/public/blog';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';

export async function generateMetadata({ params }) {
  const slugData = params.slug;
  const blogData = await getSingleBlog(slugData);
  const resource = blogData?.blogs;

  if (!resource) return {};

  const canonicalUrl = `https://embroidize.com/resource/${resource.slug}`;

  return {
    title: resource?.meta_title || resource?.title,
    description:
      resource?.meta_description ||
      'Explore the latest embroidery design tutorials, tips, and updates from the Embroidize team.',
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: resource?.meta_keywords?.join(', '),
    authors: [{ name: resource?.author || 'Embroidize Team' }],
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: resource?.meta_title || resource?.title,
      description: resource?.meta_description,
      siteName: 'Embroidize',
      publishedTime: resource?.createdAt,
      modifiedTime: resource?.updatedAt,
      images: [
        {
          url: resource?.image?.url,
          width: 1200,
          height: 630,
          alt: resource?.title,
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: resource?.meta_title || resource?.title,
      description: resource?.meta_description,
      images: [resource?.image?.url],
      creator: '@embroidize',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function SingleBlogPage({ params }) {
  const slugData = params.slug;
  const blogData = await getSingleBlog(slugData);
  const resource = blogData?.blogs;

  if (!resource) return notFound();

  const canonicalUrl = `https://embroidize.com/resource/${resource.slug}`;
  const readingTime = Math.ceil(resource?.description.length / 200);

  // Enhanced JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: resource?.title,
    description: resource?.meta_description,
    image: {
      '@type': 'ImageObject',
      url: resource?.image?.url,
      width: 1200,
      height: 630,
    },
    author: {
      '@type': 'Organization',
      name: resource?.author || 'Embroidize Team',
      url: 'https://embroidize.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Embroidize',
      logo: {
        '@type': 'ImageObject',
        url: 'https://embroidize.com/logo.png',
      },
    },
    datePublished: resource?.createdAt,
    dateModified: resource?.updatedAt || resource?.createdAt,
    timeRequired: `PT${readingTime}M`,
    keywords: resource?.meta_keywords?.join(', '),
    articleSection: 'Embroidery Resources',
    inLanguage: 'en-US',
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://embroidize.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Resources',
        item: 'https://embroidize.com/resource',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: resource?.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <Header />

      <main className='container mx-auto px-4 py-8 max-w-7xl'>
        {/* JSON-LD Structured Data */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />

        {/* Breadcrumb Navigation */}
        <nav className='mb-8' aria-label='Breadcrumb'>
          <ol className='flex items-center space-x-2 text-sm'>
            <li>
              <Link
                href='/'
                className='text-gray-600 hover:text-gray-900 transition-colors'
              >
                Home
              </Link>
            </li>
            <li className='text-gray-400'>/</li>
            <li>
              <Link
                href='/resource'
                className='text-gray-600 hover:text-gray-900 transition-colors'
              >
                Resources
              </Link>
            </li>
            <li className='text-gray-400'>/</li>
            <li className='text-gray-900 font-medium truncate max-w-xs'>
              {resource?.title}
            </li>
          </ol>
        </nav>

        {/* Back Button */}
        <div className='mb-6'>
          <Link
            href='/resources'
            prefetch={false}
            className='button inline-flex items-center gap-2 transition-colors'
            aria-label='Back to Resources'
          >
            <svg
              className='w-4 h-4 transition-transform group-hover:-translate-x-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
            Back to Resources
          </Link>
        </div>

        {/* Article */}
        <article
          itemScope
          itemType='https://schema.org/BlogPosting'
          className='bg-white rounded-2xl shadow-lg overflow-hidden'
        >
          {/* Hero Section */}
          <div className='grid lg:grid-cols-5 gap-8 p-8 lg:p-12'>
            {/* Left Column - Content (60%) */}
            <div className='lg:col-span-3 flex flex-col justify-center space-y-6'>
              {/* Publishing Date */}
              <time
                className='inline-block text-sm font-bold uppercase tracking-wide'
                dateTime={resource?.createdAt}
                itemProp='datePublished'
              >
                {new Date(resource?.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>

              {/* Title */}
              <h1
                className='text-4xl lg:text-5xl font-bold text-gray-900 leading-tight'
                itemProp='headline'
              >
                {resource?.title}
              </h1>

              {/* Meta Description */}
              <p
                className='text-xl text-gray-600 leading-relaxed'
                itemProp='description'
              >
                {resource?.meta_description}
              </p>

              {/* Author & Reading Time */}
              <div className='flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold'>
                    {(resource?.author || 'E')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-900'>
                      {resource?.author || 'Embroidize Team'}
                    </p>
                    <meta
                      itemProp='author'
                      content={resource?.author || 'Embroidize Team'}
                    />
                  </div>
                </div>
                <span className='text-gray-300'>•</span>
                <span className='text-sm text-gray-600'>
                  {readingTime} min read
                </span>
              </div>

              {/* Share Section */}
              <div className='flex items-center gap-4 pt-4'>
                <span className='text-sm font-medium text-gray-700'>
                  Share:
                </span>
                <ShareButtons
                  url={canonicalUrl}
                  title={resource?.title}
                  description={resource?.meta_description}
                />
              </div>
            </div>

            {/* Right Column - Featured Image (40%) */}
            <figure className='lg:col-span-2 relative w-full rounded-xl overflow-hidden shadow-xl'>
              <Image
                src={resource?.image?.url}
                alt={resource?.title}
                fill
                priority
                className='hover:scale-105 transition-transform duration-500'
                sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw'
                itemProp='image'
              />
            </figure>
          </div>

          {/* Article Content */}
          <div className='px-8 lg:px-12 pb-12'>
            <div className='mx-4'>
              {/* Content Body */}
              <section
                className='custom-blog-content max-w-none mt-8'
                style={{ fontSize: 18 }}
                dangerouslySetInnerHTML={{
                  __html: resource?.description,
                }}
                itemProp='articleBody'
              />

              {/* Tags/Keywords */}
              {resource?.meta_keywords && resource.meta_keywords.length > 0 && (
                <div className='mt-12 pt-8 border-t border-gray-200'>
                  <h3 className='text-sm font-semibold text-gray-700 mb-3'>
                    Tags:
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {resource.meta_keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className='px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors'
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Updated Date (if different from published) */}
              {resource?.updatedAt &&
                resource.updatedAt !== resource.createdAt && (
                  <meta itemProp='dateModified' content={resource.updatedAt} />
                )}
            </div>
          </div>
        </article>

        {/* Related Articles or CTA Section (Optional) */}
        <div className='mt-12 text-center'>
          <Link
            href='/resources'
            className='inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl'
          >
            Explore More Resources
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
