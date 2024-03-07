import { Divider } from "@nextui-org/react";
import Image from "next/image";

const BlogSection = () => {
  return (
    <>
      <section className="bg-blue-50 text-black my-8 py-6">
        <div className="flex items-center justify-center">
          <h1 className="flex justify-center text-lg font-bold">Latest News</h1>
        </div>

        <div className="flex items-center justify-center ">
          <h3 className="font-bold text-3xl">
            Latest from Blog
          </h3>
        </div>
      </section>
      <section className=" text-black my-8 py-6">
        <div className="flex items-center justify-center">
          <div class="grid grid-cols-3 gap-10 ">
            <div className="mx-12 border rounded-lg">
              <div className="bg-white-50 p-4 flex items-center justify-center ">
                <Image
                  alt="Relaxing app background"
                  className="rounded-xl "
                  src="/blog.jpg"
                  height={200}
                  width={320}
                />
              </div>
              <Divider />
              <div className=" bg-blue-50 flex-col border-default-600 dark:border-default-100 p-4">
                <div className="text-wrap">
                  <h1 className="flex justify-start text-lg font-bold">
                    How to Edit a Machine Embroidery Design
                  </h1>
                  <p className="text-wrap">
                    Have you ever had one of those craft days that make you want
                    to just put down your scissors and
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 ">
                  <p className="text-black/90 font-medium text-sm">
                    By <strong>Embring</strong>
                  </p>

                  <button
                    size="sm"
                    className="bg-black hover:bg-white hover:text-black text-white rounded-md px-[.4rem] font-semibold"
                  >
                    Read More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogSection;
