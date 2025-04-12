import ProductCard from '@/components/Common/ProductCard';
import { getProducts, getSingleProduct } from '@/lib/apis/public/products';
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
          <div className='flex flex-col w-full p-4 lg:p-10 mt-10'>
            <h1 className='text-black font-bold mb-8 text-2xl'>Item details</h1>
            <p className='text-black'>
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
          </div>
        </div>
      </div>
      {/* <SubscribeSearchSection /> */}
    </>
  );
};
