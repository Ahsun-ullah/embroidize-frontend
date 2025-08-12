import { Divider } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';

const BlogCard = ({ data }) => {
  const imageUrl =
    // data?.featuredImage // wordpress
    data?.image?.url;
  const altText =
    // data?.title.rendered // wordpress
    data?.title;

  return (
    <>
      <Link
        href={`/blog/${data?.slug}`}
        className='bg-white border rounded-2xl shadow-xl overflow-hidden group'
        aria-label={`View details for ${altText}`}
      >
        {/* Blog Image */}
        <div className='relative w-full aspect-[3/2]'>
          <Image
            src={imageUrl || 'https://embroidize.com/og-banner.jpg'}
            alt={altText}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw'
            className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
            quality={80}
            priority={true}
          />
        </div>

        <Divider />

        {/* Blog Info */}
        <div className='border-default-600 dark:border-default-100 p-4 rounded-b-2xl'>
          <div className='flex flex-col gap-2'>
            {/* Blog Title */}
            <h2
              className='text-2xl font-semibold prose max-w-none'
              dangerouslySetInnerHTML={{
                __html: data?.meta_description,

                // data.title.rendered
              }}
            />

            {/* Blog Description */}
            {/* <p
              className='prose max-w-none mt-2'
              dangerouslySetInnerHTML={{
                __html: data.excerpt.rendered.slice(0, 100),
              }}
            /> */}
          </div>
        </div>
      </Link>
    </>
  );
};

export default BlogCard;
