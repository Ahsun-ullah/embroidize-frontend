"use client";
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
} from "@heroui/react";
import Image from "next/image";
import React from "react";
import SecondHeader from "../../../../components/Common/SecondHeader";
import SubscribeSearchSection from "../../../../components/user/HomePage/SubscribeSearchSection";

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
      <SecondHeader />
      <div className="flex gap-4 mx-16 mt-10 font-medium">
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
      <div className="flex flex-col lg:flex-row justify-center mx-16 my-10 gap-10">
        <div className="basis-full lg:basis-3/4 relative">
          <Card
            isFooterBlurred
            className="w-full h-[400px] md:h-[500px] lg:h-[700px]"
          >
            <img
              alt="Card example background"
              className="z-0 w-full h-full object-cover"
              src="/blog.jpg"
            />
          </Card>
          <div className="flex flex-col mt-10">
            <h1 className="text-black text-lg font-semibold">
              Related Keywords
            </h1>
            <div className="flex gap-2 mt-4 flex-wrap">
              {Array.from({ length: 30 }).map((_, index) => (
                <Chip key={index} variant="faded" size="lg">
                  flower cart
                </Chip>
              ))}
            </div>
          </div>
          <Card isFooterBlurred className="p-4 lg:p-10 mt-10">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-black text-lg font-semibold">
                You May Also Like
              </h1>
              <Button variant="ghost">See More</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white border rounded-lg shadow-xl"
                >
                  <div className="p-4 flex items-center justify-center">
                    <Image
                      alt="Product image"
                      className="rounded-xl"
                      src="/logo.png"
                      height={200}
                      width={280}
                    />
                  </div>
                  <Divider />
                  <div className="flex flex-col p-4">
                    <div className="flex items-center justify-between gap-4">
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
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-tiny text-black">
                        Get a good night's sleep.
                      </p>
                      <i className="ri-heart-fill text-red-500"></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="basis-full lg:basis-2/4 relative">
          <Card isFooterBlurred className="flex flex-col w-full p-4 lg:p-10">
            <h1 className="text-black font-bold mb-8 text-2xl">
              Machine Embroidery design Machine Embroidery design
            </h1>
            <h1 className="text-black font-bold mb-2">Formats</h1>
            <Dropdown className="border w-full">
              <DropdownTrigger>
                <Button variant="flat" className="border pt-1 w-full">
                  Select Format
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
              className="button mt-8 pt-3 text-xl w-full"
              radius="none"
              size="lg"
              variant="light"
            >
              Free Download
            </Button>
          </Card>
          <Card
            isFooterBlurred
            className="flex flex-col w-full p-4 lg:p-10 mt-10"
          >
            <h1 className="text-black font-bold mb-8 text-2xl">Item details</h1>
            <p className="text-black">
              You will receive a zip file with the design in the following
              formats: ART, CND, DST, EXP, HUS, JEF, PCS, PES, VP3, XXX,
              <br />
              <br />
              Sizes: 4.29" X 6.00” (108.97 X 152.40 mm) 5.01" X 7.00” (127.25 X
              177.80 mm) 5.72" X 8.00” (145.29 X 203.20 mm) 6.43" X 9.00”
              (163.32 X 228.60 mm)
              <br />
              <br />
              You can change colors at your sole discretion for your projects.
              This design includes a production worksheet in a .PDF file.
              <br />
              <br />
              PLEASE NOTE: This is a digital file used for machine embroidery.
              You must have an embroidery machine and know how to transfer it to
              your machine. Please note that I am not responsible for the
              quality of the design if you resize, convert, or edit it in any
              way.
            </p>
          </Card>
        </div>
      </div>
      <SubscribeSearchSection />
    </>
  );
};

export default ProductDetails;
