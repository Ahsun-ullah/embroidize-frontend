import { Divider } from '@heroui/react';
import Link from 'next/link';

const BlogCard = ({ data }) => {
  return (
    <Link
      href={`/blog/${data?.title.split(' ').join('-')}?id=${data?._id}`}
      className='bg-white border rounded-2xl shadow-xl'
    >
      <div
        className='aspect-[4/3] w-full bg-cover bg-center bg-no-repeat p-6 flex items-center justify-center rounded-t-2xl'
        style={{
          backgroundImage: `url(${data?.image?.url || '/images.jpg'})`,
        }}
      ></div>
      <Divider />
      <div className='border-default-600 dark:border-default-100 p-4 rounded-b-2xl'>
        <div className='text-wrap'>
          <h1 className='text-lg font-bold'>{data?.title ?? 'Blog Title'}</h1>
          <p className='text-sm'>
            {data?.description.slice(0, 100) ?? 'Blog description goes here...'}
          </p>
        </div>
        {/* <div className='flex items-center justify-between gap-4'>
          <p className='text-sm text-black/90 font-medium'>
            By <strong>Embring</strong>
          </p>
          <button className='bg-black hover:bg-white hover:text-black text-white rounded-md px-2 font-semibold'>
            Read More
          </button>
        </div> */}
      </div>
    </Link>
  );
};

export default BlogCard;
