import { Button, Divider } from "@nextui-org/react";
import Image from "next/image";
import React from "react";
import Footer from "../../../components/HomePage/Footer";
import Header from "../../../components/HomePage/Header";

const CategoryProducts = () => {
  return (
    <>
      <Header />

      <div className="h-screen ">
        <section className=" text-black my-8 py-6">
          <div className="flex items-center justify-center ">
            <div class="grid grid-cols-4 gap-10 ">
              <div className="bg-white  border rounded-lg shadow-xl">
                <div className="p-6 flex items-center justify-center ">
                  <Image
                    alt="Relaxing app background"
                    className="rounded-xl "
                    src="/logo.png"
                    height={200}
                    width={280}
                  />
                </div>
                <Divider />
                <div className="flex-col border-default-600 dark:border-default-100 p-4">
                  <div className="flex items-center justify-between gap-4 ">
                    <p className="text-black/90 font-medium text-sm">
                      Your checklist for better sleep
                    </p>

                    <Button
                      radius="full"
                      size="sm"
                      className="bg-black text-white"
                    >
                      Get App
                    </Button>
                  </div>
                  <div className="flex items-center justify-between ">
                    <p className="text-tiny text-black">
                      Get a good night sleep.
                    </p>
                    <i className="ri-heart-fill text-red-500"></i>
                  </div>
                </div>
              </div>
              <div className="bg-white  border rounded-lg shadow-xl">
                <div className="p-6 flex items-center justify-center ">
                  <Image
                    alt="Relaxing app background"
                    className="rounded-xl "
                    src="/logo.png"
                    height={200}
                    width={280}
                  />
                </div>
                <Divider />
                <div className="flex-col border-default-600 dark:border-default-100 p-4">
                  <div className="flex items-center justify-between gap-4 ">
                    <p className="text-black/90 font-medium text-sm">
                      Your checklist for better sleep
                    </p>

                    <Button
                      radius="full"
                      size="sm"
                      className="bg-black text-white"
                    >
                      Get App
                    </Button>
                  </div>
                  <div className="flex items-center justify-between ">
                    <p className="text-tiny text-black">
                      Get a good night sleep.
                    </p>
                    <i className="ri-heart-fill text-red-500"></i>
                  </div>
                </div>
              </div>
              <div className="bg-white  border rounded-lg shadow-xl">
                <div className="p-6 flex items-center justify-center ">
                  <Image
                    alt="Relaxing app background"
                    className="rounded-xl "
                    src="/logo.png"
                    height={200}
                    width={280}
                  />
                </div>
                <Divider />
                <div className="flex-col border-default-600 dark:border-default-100 p-4">
                  <div className="flex items-center justify-between gap-4 ">
                    <p className="text-black/90 font-medium text-sm">
                      Your checklist for better sleep
                    </p>

                    <Button
                      radius="full"
                      size="sm"
                      className="bg-black text-white"
                    >
                      Get App
                    </Button>
                  </div>
                  <div className="flex items-center justify-between ">
                    <p className="text-tiny text-black">
                      Get a good night sleep.
                    </p>
                    <i className="ri-heart-fill text-red-500"></i>
                  </div>
                </div>
              </div>
              <div className="bg-white  border rounded-lg shadow-xl">
                <div className="p-6 flex items-center justify-center ">
                  <Image
                    alt="Relaxing app background"
                    className="rounded-xl "
                    src="/logo.png"
                    height={200}
                    width={280}
                  />
                </div>
                <Divider />
                <div className="flex-col border-default-600 dark:border-default-100 p-4">
                  <div className="flex items-center justify-between gap-4 ">
                    <p className="text-black/90 font-medium text-sm">
                      Your checklist for better sleep
                    </p>

                    <Button
                      radius="full"
                      size="sm"
                      className="bg-black text-white"
                    >
                      Get App
                    </Button>
                  </div>
                  <div className="flex items-center justify-between ">
                    <p className="text-tiny text-black">
                      Get a good night sleep.
                    </p>
                    <i className="ri-heart-fill text-red-500"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default CategoryProducts;
