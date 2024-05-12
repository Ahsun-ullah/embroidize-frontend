"use client";
/* eslint-disable @next/next/no-img-element */
import {
  Button,
  Card,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import React from "react";
import SecondHeader from "../../../../components/Common/SecondHeader";
import Header from "../../../../components/HomePage/Header";

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

      <div className="flex justify-center flex-row mx-64 mt-10">
        <div className="basis-3/4 relative">
          <Card
            isFooterBlurred
            className="w-[700px] h-[700px] col-span-12 sm:col-span-5 "
          >
            <img
              removeWrapper
              alt="Card example background"
              className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
              src="/blog.jpg"
            />
          </Card>
        </div>
        <div className=" basis-3/4 relative">
          <Card isFooterBlurred className="flex items-start  w-4/6 px-10 py-10">
            <h1 className="text-black font-bold mb-8 text-2xl">
              Machine Embroidery design
            </h1>
            <h1 className="text-black font-bold mb-1">Formats</h1>
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
            <button className="button mt-6">Free Download</button>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
