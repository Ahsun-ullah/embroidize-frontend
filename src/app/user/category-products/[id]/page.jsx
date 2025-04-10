'use client';
import { Button, Divider } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import Pagination from '../../../../components/Common/Pagination';
import ProductCard from '@/components/Common/ProductCard';

const CategoryProducts = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [perPageData, setPerPageData] = useState(1);

  let objectsArray = [
    { name: 'Chair', color: 'Brown', material: 'Wood' },
    { name: 'Laptop', brand: 'Dell', model: 'XPS 13' },
    { fruit: 'Apple', color: 'Red', origin: 'Washington' },
    { city: 'Paris', country: 'France', population: 2141000 },
    { name: 'Book', genre: 'Fantasy', author: 'J.K. Rowling' },
  ];

  return (
    <>
      <div className="min-h-screen flex flex-col justify-between">
        <section className="text-black my-8 py-6 border-b-2">
          <div className="flex items-center justify-center mx-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {objectsArray.map((item, index) => (
                 <ProductCard key={index} item={item} />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center mt-6">
            <Pagination
              style={{
                position: 'relative',
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
    </>
  );
};

export default CategoryProducts;
