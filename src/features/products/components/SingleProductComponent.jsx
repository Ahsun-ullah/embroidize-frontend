import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ProductCard from '@/components/Common/ProductCard';
import { getProducts, getSingleProduct } from '@/lib/apis/public/products';
import { capitalize } from '@/utils/functions/page';
import { marked } from 'marked';
import { Suspense, use } from 'react';
import { BreadCrumb } from './BreadCrumb';
import ProductDownloadCard from './ProductDownloadCard';
import { SingleProductImageCard } from './SingleProductImageCard';

export const SingleProductComponent = ({ params }) => {
  const { id } = use(params);
  const singleProductData = use(getSingleProduct(id));
  const allProductData = use(getProducts());

  const rawMarkup = marked(singleProductData?.data?.description || '');

  return (
    <div className='container mx-auto'>
      <div className='flex font-medium mb-4'>
        <BreadCrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Product', href: '/user/products' },
            {
              label: `${capitalize(singleProductData?.data?.category?.name)}`,
              href: `/user/category-products/${singleProductData?.data?.category?._id}`,
            },
            {
              label: `${capitalize(singleProductData?.data?.name)}`,
              href: `/user/product-details/${singleProductData?.data?._id}`,
            },
          ]}
        />
      </div>
      <div className='flex flex-col lg:flex-row justify-center gap-10'>
        <div className='basis-full lg:basis-3/4 relative'>
          <Suspense fallback={<LoadingSpinner />}>
            <SingleProductImageCard data={singleProductData?.data} />
          </Suspense>

          <div className='bg-white mt-10 w-full  rounded-2xl p-4 shadow-xl'>
            <h1 className='text-black font-bold mb-8 text-2xl'>Item details</h1>
            <pre
              dangerouslySetInnerHTML={{ __html: rawMarkup }}
              className='prose max-w-none break-words text-wrap'
            />
          </div>
          <div className='flex flex-col mt-10'>
            <h1 className='text-black text-lg font-semibold'>
              Related Keywords
            </h1>
            <div className='flex gap-2 mt-4 flex-wrap'>
              <div className='flex gap-2 mt-4 flex-wrap'>
                {Array.isArray(singleProductData?.data?.meta_keywords) &&
                  singleProductData.data.meta_keywords.map((item, index) => (
                    <div
                      key={index}
                      className='bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium capitalize'
                    >
                      {item}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className='basis-full lg:basis-2/4 relative'>
          <ProductDownloadCard data={singleProductData?.data} />
          <div className='mt-10'>
            <div className='flex items-center justify-between mb-6'>
              <h1 className='text-black text-lg font-semibold'>
                You May Also Like
              </h1>
              <button variant='ghost'>See More</button>
            </div>
            <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2'>
              {allProductData?.data?.map((item, index) => (
                <ProductCard item={item} key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* <SubscribeSearchSection /> */}
    </div>
  );
};
