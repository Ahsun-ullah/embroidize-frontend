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

  const canonicalUrl = `https://embroidize.com/resources/${resource.slug}`;

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

  const canonicalUrl = `https://embroidize.com/resources/${resource.slug}`;
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
        url: 'https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/favicon-white.png',
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
        item: 'https://embroidize.com/resources',
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
                href='/resources'
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
          <div className='flex flex-col space-y-8 *:items-center px-8 lg:px-12 pt-12 pb-8 bg-gray-50'>
            {/* Title */}
            <h1
              className='text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight'
              itemProp='headline'
            >
              {resource?.title}
            </h1>
            {/* Publishing Date Badge */}
            <time
              className='inline-flex items-center gap-2 w-fit px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-sm border border-blue-200'
              dateTime={resource?.createdAt}
              itemProp='datePublished'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              {new Date(resource?.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>

            {/* Meta Description */}
            <p
              className='text-xl text-gray-600 leading-relaxed'
              itemProp='description'
            >
              {resource?.meta_description}
            </p>

            {/* Author & Meta Info Card */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200'>
              {/* Author Info */}
              <div className='flex items-center gap-4'>
                <div className='w-9 h-9 rounded-full flex items-center justify-center bg-white border-2 border-white/30 shadow-lg flex-shrink-0 overflow-hidden'>
                  <Image
                    src='/favicon.ico'
                    alt='Embroidize'
                    width={36}
                    height={36}
                    className='object-contain'
                  />
                </div>
                <div>
                  <p className='text-sm text-gray-500 font-medium'>
                    Written by
                  </p>
                  <p className='text-base font-bold text-gray-900'>
                    {resource?.author || 'Embroidize Team'}
                  </p>
                  <meta
                    itemProp='author'
                    content={resource?.author || 'Embroidize Team'}
                  />
                </div>
              </div>

              {/* Reading Time */}
              <div className='flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm'>
                <svg
                  className='w-5 h-5 text-gray-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <span className='text-sm font-semibold text-gray-700'>
                  {readingTime} min read
                </span>
              </div>
            </div>

            {/* Share Section */}
            <div className='flex flex-col sm:flex-row sm:items-center gap-4 pt-2'>
              <span className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                <svg
                  className='w-5 h-5 text-gray-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z'
                  />
                </svg>
                Share this article:
              </span>
              <ShareButtons
                url={canonicalUrl}
                title={resource?.title}
                description={resource?.meta_description}
              />
            </div>
          </div>

          {/* Article Content */}
          <div className='px-8 lg:px-12 pb-12'>
            <div className='mx-4'>
              {/* Content Body */}
              <section
                className='prose prose-2xl custom-blog-content max-w-none mt-8'
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
