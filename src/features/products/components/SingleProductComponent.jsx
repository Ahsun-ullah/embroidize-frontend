import ProductCard from '@/components/Common/ProductCard';
import { getProducts, getSingleProduct } from '@/lib/apis/public/products';
import DOMPurify from 'dompurify';
import { use } from 'react';
import { BreadCrumb } from './BreadCrumb';
import ProductDownloadCard from './ProductDownloadCard';
import { SingleProductImageCard } from './SingleProductImageCard';

export const SingleProductComponent = ({ params }) => {
  const { id } = use(params);
  const singleProductData = use(getSingleProduct(id));
  const allProductData = use(getProducts());

  console.log(singleProductData?.data);

  return (
    <>
      <div className='flex gap-4 mx-16 font-medium'>
        <BreadCrumb />
      </div>
      <div className='flex flex-col lg:flex-row justify-center mx-16 my-10 gap-10'>
        <div className='basis-full lg:basis-3/4 relative'>
          <SingleProductImageCard data={singleProductData?.data} />
          <div className='flex flex-col mt-10'>
            <h1 className='text-black text-lg font-semibold'>
              Related Keywords
            </h1>
            <div className='flex gap-2 mt-4 flex-wrap'>
              {singleProductData?.data?.meta_keywords.map((item, index) => (
                <div key={index} variant='faded' size='lg'>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className='mt-10'>
            <div className='flex items-center justify-between mb-6'>
              <h1 className='text-black text-lg font-semibold'>
                You May Also Like
              </h1>
              <button variant='ghost'>See More</button>
            </div>
            <div className='gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3'>
              {allProductData?.data.map((item, index) => (
                <ProductCard item={item} key={index} />
              ))}
            </div>
          </div>
        </div>
        <div className='basis-full lg:basis-2/4 relative'>
          <ProductDownloadCard data={singleProductData?.data} />

        </div>
      </div>
      {/* <SubscribeSearchSection /> */}
    </>
  );
};
