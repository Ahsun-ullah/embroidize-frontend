import { Divider } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';

const BlogCard = ({ data }) => {
  const imageUrl = data?.image?.url || '/images.jpg';

  return (
    <Link
      href={`/blog/${data?.title?.split(' ').join('-') ?? 'blog'}?id=${data?._id}`}
      className='bg-white border rounded-2xl shadow-xl overflow-hidden group'
    >
      {/* Blog Image */}
      <div className='relative w-full aspect-[4/3]'>
        <Image
          src={imageUrl}
          alt={data?.title ?? 'Blog Post Image'}
          fill
          sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw'
          className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
          placeholder='blur'
          blurDataURL='/https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/placeholder.jpg'
        />
      </div>

      <Divider />

      {/* Blog Info */}
      <div className='border-default-600 dark:border-default-100 p-4 rounded-b-2xl'>
        <div className='flex flex-col gap-2'>
          {/* Blog Title */}
          <h1 className='text-lg font-bold line-clamp-2'>
            {data?.title ?? 'Blog Title'}
          </h1>

          {/* Blog Description */}
          <p className='text-sm text-black/80 line-clamp-3'>
            {data?.description.slice(0, 100) ?? 'Blog description goes here...'}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
