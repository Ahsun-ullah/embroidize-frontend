/* eslint-disable react/no-unescaped-entities */
"use client";
/* eslint-disable @next/next/no-img-element */
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Card,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import Image from "next/image";
import React from "react";
import SecondHeader from "../../../../components/Common/SecondHeader";
import Footer from "../../../../components/HomePage/Footer";
import Header from "../../../../components/HomePage/Header";
import SubscribeSearchSection from "../../../../components/HomePage/SubscribeSearchSection";

const ProductDetails = () => {
  const items = [
    {
      key: "new",
      label: "New file",
    },
    {
      key: "copy",
      label: "Copy link",
    },
    {
      key: "edit",
      label: "Edit file",
    },
  ];
  return (
    <>
      <Header />
      <SecondHeader />
      <div className="flex gap-4 mx-64 mt-10 font-medium ">
        <Breadcrumbs size="lg" className="flex">
          <BreadcrumbItem href="/docs/components/button">Button</BreadcrumbItem>
          <BreadcrumbItem href="/docs/components/breadcrumbs">
            Breadcrumbs
          </BreadcrumbItem>
          <BreadcrumbItem href="/docs/components/card">Card</BreadcrumbItem>
          <BreadcrumbItem href="/docs/components/checkbox">
            Checkbox
          </BreadcrumbItem>
          <BreadcrumbItem href="/docs/components/code">Code</BreadcrumbItem>
        </Breadcrumbs>
      </div>
      <div className="flex justify-center flex-row ms-64 my-10">
        <div className="basis-3/4 relative">
          <Card
            isFooterBlurred
            className="w-[800px] h-[700px] col-span-12 sm:col-span-5 me-10"
          >
            <img
              removeWrapper
              alt="Card example background"
              className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
              src="/blog.jpg"
            />
          </Card>

          <div className="flex-col mt-10 ">
            <h1 className="text-black text-lg font-semibold">
              Related Keywords
            </h1>
            <div className="flex gap-4 mt-4 flex-wrap">
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
              <Chip variant="faded" size="lg">
                flower cart
              </Chip>
            </div>
          </div>
          <Card
            isFooterBlurred
            className=" col-span-12 sm:col-span-5 p-10 mt-10 me-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-black text-lg font-semibold">
                You May Also Like
              </h1>
              <Button className="" variant="ghost">
                See More
              </Button>
            </div>

            <div className="flex items-center justify-center ">
              <div class="grid grid-cols-3 gap-10 ">
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
          </Card>
        </div>

        {/* Side Information */}
        <div className=" basis-3/4 relative">
          <Card isFooterBlurred className="flex items-start  w-4/6 px-10 py-10">
            <h1 className="text-black font-bold mb-8 text-2xl">
              Machine Embroidery design Machine Embroidery design
            </h1>
            <h1 className="text-black font-bold mb-2">Formats</h1>
            <Dropdown className=" border">
              <DropdownTrigger>
                <Button variant="flat" className="border pt-1">
                  Select Format{" "}
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Dynamic Actions" items={items}>
                {(item) => (
                  <DropdownItem
                    key={item?.key}
                    className={item.key === "delete" ? "text-danger" : ""}
                  >
                    {item?.label}
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>

            <Button
              style={{ height: "35px", width: "" }}
              radius="none"
              size="lg"
              variant="light"
              className="button mt-8 pt-3 text-xl"
            >
              Free Download
            </Button>
          </Card>

          {/* Item details card */}
          <Card
            isFooterBlurred
            className="flex items-start  w-4/6 px-10 py-10 mt-10"
          >
            <h1 className="text-black font-bold mb-8 text-2xl">Item details</h1>
            <h1 className="text-black font-bold mb-2">
              You will receive a zip file with the design in the following
              formats:ART, CND, DST, EXP, HUS, JEF, PCS, PES, VP3, XXX,
              <br />
              <br />
              Sizes:4.29" X 6.00” (108.97 X 152.40 mm)5.01" X 7.00” (127.25 X
              177.80 mm)5.72" X 8.00” (145.29 X 203.20 mm)6.43" X 9.00” (163.32
              X 228.60 mm)
              <br />
              <br />
              You can change colors in its sole discretion for their
              projects.This design include production worksheet in .PDF file.
              <br />
              <br />
              PLEASE NOTE:It is a digital file used for machine embroidery. You
              must have an embroidery machine and knows how to transfer to your
              machine.Please note that I am not responsible for the quality of
              the design if you resize it, convert it, or edit it in any way
              This design include production worksheet in .PDF file.
              <br />
              <br />
              PLEASE NOTE:It is a digital file used for machine embroidery. You
              must have an embroidery machine and knows how to transfer to your
              machine.Please note that I am not responsible for the quality of
              the design if you resize it, convert it, or edit it in any way.
            </h1>
          </Card>
        </div>
      </div>
      <SubscribeSearchSection />
      <Footer />
    </>
  );
};

export default ProductDetails;
