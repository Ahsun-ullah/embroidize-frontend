import BlogCard from '@/components/Common/BlogCard';

const BlogSection = ({ blogs }) => {
  return (
    <>
      <section
        style={{ backgroundColor: '#fafafa' }}
        className=' text-black my-8 py-6'
      >
        <div>
          <div className='flex items-center justify-center'>
            <h1 className='text-3xl font-bold'>Latest From Blog</h1>
          </div>
          <div className='flex items-center justify-center mt-4'>
            <p className='font-bold text-lg text-center'>
              Tips, Trends & Tutorials You’ll Love
            </p>
          </div>
        </div>
      </section>
      <section className='text-black my-8 py-6'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {blogs.slice(0, 4).map((item, index) => (
              <BlogCard key={index} data={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogSection;
