import { Input } from "@nextui-org/react";

const SubscribeSearchSection = () => {
  return (
    <>
      <section className="bg-blue-50 text-black  py-10 my-16">
        <h1 className="flex justify-center text-xl font-bold">
          Frequently Asked Questions
        </h1>
        <div className="flex justify-center content-center my-4">
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
            endContent={
              <button className="px-2 rounded-full bg-black font-semibold hover:bg-blue-400 text-white  ">
                Subscribe
              </button>
            }
            type="search"
          />
        </div>
      </section>
    </>
  );
};

export default SubscribeSearchSection;
