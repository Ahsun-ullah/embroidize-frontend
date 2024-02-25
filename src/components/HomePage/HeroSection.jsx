import { Input } from "@nextui-org/react";

const HeroSection = () => {
  return (
    <>
      <section className=" bg-blue-50  py-[10rem] text-black">
        <div className="flex flex-col  ">
          <div className=" flex justify-center content-center">
            <h1 className="text-3xl font-bold ">Machine Embroidery Designs</h1>
          </div>
          <div className="flex justify-center content-center mb-4">
            <h4>
              All you need for your next machine embroidery project. The highest
              quality for the lowest price.
            </h4>
          </div>
          <div className="flex justify-center content-center">
            <Input
              radius="full"
              isBordered
              classNames={{
                base: "max-w-[25rem] max-sm:max-w-[10rem] h-10 ",
                mainWrapper: "h-full",
                input: "text-small",
                inputWrapper: "h-full font-normal text-black bg-white ",
              }}
              placeholder="Type to search..."
              size="sm"
              endContent={<i class="ri-search-eye-fill text-xl"></i>}
              type="search"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
