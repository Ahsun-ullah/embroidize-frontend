import { Button, Card, Divider } from '@heroui/react';

const RecentProductsSection = () => {
  return (
    <>
      <section className='bg-blue-50 text-black my-8 py-6'>
        <div className='flex items-center justify-center'>
          <h1 className='text-3xl font-bold'>Recent Approved Products</h1>
        </div>
        <div className='flex items-center justify-center mt-4'>
          <h3 className='font-semibold'>
            Design for every Budget & every Project.
          </h3>
        </div>
      </section>
      <section className='text-black my-8 py-6'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10'>
            {Array.from({ length: 4 }).map((_, index) => (
              <Card
                key={index}
                className='bg-white border rounded-2xl shadow-xl'
              >
                <div
                  style={{
                    backgroundImage: `url('/category.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    height: '200px',
                    width: '100%',
                  }}
                  className='p-6 flex items-center justify-center'
                ></div>
                <Divider />
                <div className='flex flex-col border-default-600 dark:border-default-100 p-4'>
                  <div className='flex items-center justify-between gap-4'>
                    <p className='text-sm font-medium'>{`Your checklist for better sleep ${
                      index + 1
                    }`}</p>
                    <Button
                      radius='full'
                      size='sm'
                      className='bg-black text-white'
                    >
                      Get App
                    </Button>
                  </div>
                  <div className='flex items-center justify-between mt-2'>
                    <p className='text-xs text-black'>
                      Get a good night sleep.
                    </p>
                    <i className='ri-heart-fill text-red-500'></i>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className='flex justify-center items-center mt-14'>
            <button className='bg-black rounded-full hover:bg-blue-400 text-white font-medium px-6 py-2'>
              View All
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default RecentProductsSection;
