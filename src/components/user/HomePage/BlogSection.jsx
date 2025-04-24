import BlogCard from '@/components/Common/BlogCard';
import { getBlogs } from '@/lib/apis/public/blog';
import Link from 'next/link';
import { use } from 'react';

const BlogSection = () => {
  const { blogs } = use(getBlogs());

  return (
    <>
      <section className='bg-blue-50 text-black my-8 py-6'>
        <div className='flex items-center justify-center'>
          <h1 className='text-3xl font-bold'>Latest News</h1>
        </div>
        <div className='flex items-center justify-center mt-4'>
          <h3 className='font-bold text-3xl'>Latest from Blog</h3>
        </div>
      </section>
      <section className='text-black my-8 py-6'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
            {blogs.slice(0, 3).map((item, index) => (
              <BlogCard key={item?._id} data={item} />
            ))}
          </div>
        </div>
        <div className='flex justify-center items-center mt-14'>
            <Link
              href={'/blog'}
              className='bg-black rounded-full hover:bg-blue-400 text-white font-medium px-6 py-2'
            >
              View All
            </Link>
          </div>
      </section>
    </>
  );
};

export default BlogSection;
