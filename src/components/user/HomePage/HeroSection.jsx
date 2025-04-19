import Link from 'next/link';

const HeroSection = () => {
  return (
    <section
      style={{
        backgroundImage: `url('/home-banner.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      className='flex items-center min-h-[470px] w-full max-w-full mx-0 px-0 bg-gray-200 relative '
    >
      <div className='flex justify-end absolute top-0 bottom-0 w-full pe-[10%]'>
        <div className='flex flex-col items-center justify-center text-white'>
          <h1 className=' text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-center'>
            Machine <br />
            Embroidery Designs
          </h1>
          <p className='text-sm sm:text-base md:text-lg text-center mb-4 max-w-2xl'>
            All you need for your next machine embroidery project. <br /> The
            highest quality for the lowest price.
          </p>
          <Link
            href='/products'
            className='bg-white text-black font-bold transition duration-300 ease-in-out hover:opacity-60 focus:opacity-60 px-4 py-1 rounded-full'
            passHref
          >
            <span className='text-black'>Shop Now</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
