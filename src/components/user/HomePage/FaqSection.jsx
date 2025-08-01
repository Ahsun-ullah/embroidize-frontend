import { Divider } from '@heroui/react';

const FaqSection = () => {
  return (
    <>
      <section className="bg-blue-50 text-black my-8 py-6">
        <div className="flex items-center justify-center">
          <h1 className="flex justify-center text-3xl font-bold">
            Frequently Asked Questions
          </h1>
        </div>

        <div className="flex items-center justify-center ">
          <h3 className="font-semibold">
            A list of commonly asked questions and answers on this website about
            topics.
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center mt-6">
          <div className="my-6">
            {' '}
            {'>'} Can these Embroidery designs be used for Machine Embroidery?
          </div>
          <Divider className="" />
          <div className="my-6"> {'>'} What file formats are included in the downloads? </div>
          <Divider />
          <div className="my-6"> {'>'} Are the designs compatible with my embroidery machine? </div>
          <Divider />
          <div className="my-6"> {'>'} Can I use these designs for commercial purposes? </div>
        </div>
      </section>
    </>
  );
};

export default FaqSection;
