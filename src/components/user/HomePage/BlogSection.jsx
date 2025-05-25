import BlogCard from '@/components/Common/BlogCard';

const BlogSection = ({ blogs }) => {
  return (
    <>
      
      <section className='text-black my-8 py-6'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
            {blogs.slice(0, 3).map((item, index) => (
              <BlogCard key={item?._id} data={item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogSection;
