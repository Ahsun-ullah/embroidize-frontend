import { Input } from '@heroui/react';

const HeroSection = () => {
  return (
    <>
      <section className="bg-blue-50 py-[10rem] text-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center">
              Machine Embroidery Designs
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-center mb-4">
              All you need for your next machine embroidery project. The highest
              quality for the lowest price.
            </p>
            <div className="flex justify-center content-center mt-4">
              <Input
                radius="full"
                isBordered
                classNames={{
                  base: 'max-w-[25rem] max-sm:max-w-[10rem] h-10 ',
                  mainWrapper: 'h-full',
                  input: 'text-small',
                  inputWrapper: 'h-full font-normal text-black bg-white ',
                }}
                placeholder="Type to search..."
                size="sm"
                endContent={<i className="ri-search-eye-fill text-xl"></i>}
                type="search"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
