import { Divider } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';

const BlogCard = ({ data }) => {
  const imageUrl = data?.image?.url;
  const altText = data?.title
    ? `Cover image for "${data.title}"`
    : 'Blog Post Image';

  return (
    <>
      <Link
        href={`/blog/${data?.slug}`}
        className='bg-white border rounded-2xl shadow-xl overflow-hidden group'
      >
        {/* Blog Image */}
        <div className='relative w-full aspect-[4/3]'>
          <Image
            src={imageUrl || 'https://embroidize.com/og-banner.jpg'}
            alt={altText}
            fill
            className='object-fit object-center transition-transform duration-300 group-hover:scale-105'
            quality={80}
            priority={true}
            sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw'
          />
        </div>

        <Divider />

        {/* Blog Info */}
        <div className='border-default-600 dark:border-default-100 p-4 rounded-b-2xl'>
          <div className='flex flex-col gap-2'>
            {/* Blog Title */}
            <h2 className='text-lg font-bold line-clamp-2'>
              {data?.title ?? 'Blog Title'}
            </h2>

            {/* Blog Description */}
            <p className='text-sm text-black/80 line-clamp-3'>
              {data?.meta_description ?? 'Blog description goes here...'}
            </p>
          </div>
        </div>
      </Link>
    </>
  );
};

export default BlogCard;
