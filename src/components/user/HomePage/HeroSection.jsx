import Image from 'next/image';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className='relative w-full aspect-[4/1.9] sm:aspect-[4/1.8] md:aspect-[4/1.5] lg:aspect-[4/1.3] flex items-center overflow-hidden'>
      {/* Background Image */}
      <Image
        src='https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/home-banner.png'
        alt='Machine Embroidery Designs'
        fill
        sizes='100vw'
        priority
        className='object-cover object-center'
      />

      {/* Content */}
      <div className='flex justify-end absolute inset-0 w-full pe-[10%]'>
        <div className='flex flex-col items-center justify-center text-white'>
          <h1 className='text-white text-base sm:text-3xl md:text-4xl lg:text-5xl font-bold my-2 text-center'>
            Machine <br />
            Embroidery Designs
          </h1>
          <p className='text-xs sm:text-base md:text-lg text-center my-2 max-w-2xl'>
            All you need for your next machine embroidery project. <br /> The
            highest quality for free.
          </p>
          <Link
            href='/products'
            className='bg-white text-black text-xs sm:text-base md:text-lg font-bold transition duration-300 ease-in-out hover:opacity-60 focus:opacity-60 px-4 py-1 rounded-full'
            passHref
          >
            <span className='text-black'>Download Now</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
