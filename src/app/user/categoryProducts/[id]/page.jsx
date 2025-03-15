"use client";
import { Button, Divider } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Pagination from "../../../../components/Common/Pagination";
import Header from "../../../../components/user/HomePage/Header";
import Footer from "../../../../components/user/HomePage/Footer";

const CategoryProducts = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [perPageData, setPerPageData] = useState(1);

  let objectsArray = [
    { name: "Chair", color: "Brown", material: "Wood" },
    { name: "Laptop", brand: "Dell", model: "XPS 13" },
    { fruit: "Apple", color: "Red", origin: "Washington" },
    { city: "Paris", country: "France", population: 2141000 },
    { name: "Book", genre: "Fantasy", author: "J.K. Rowling" },
  ];

  return (
    <>
      <Header />

      <div className="min-h-screen flex flex-col justify-between">
        <section className="text-black my-8 py-6 border-b-2">
          <div className="flex items-center justify-center mx-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {objectsArray.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border rounded-lg shadow-xl"
                >
                  <div className="p-6 flex items-center justify-center">
                    <Link href={"/user/productDetails/jsf"}>
                      <Image
                        alt="Product image"
                        className="rounded-xl"
                        src="/logo.png"
                        height={200}
                        width={280}
                      />
                    </Link>
                  </div>
                  <Divider />
                  <div className="flex-col border-default-600 dark:border-default-100 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-black/90 font-medium text-sm">
                        Your checklist for better sleep Your checklist
                      </p>

                      <Button
                        radius="full"
                        size="sm"
                        className="bg-black text-white text-lg"
                      >
                        Free
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <i className="ri-heart-fill text-red-500"></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center mt-6">
            <Pagination
              style={{
                position: "relative",
                bottom: 0,
                right: 20,
              }}
              data={objectsArray}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              perPageData={perPageData}
            />
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default CategoryProducts;
