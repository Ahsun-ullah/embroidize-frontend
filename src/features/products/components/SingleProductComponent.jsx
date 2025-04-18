import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ProductCard from '@/components/Common/ProductCard';
import { getProducts, getSingleProduct } from '@/lib/apis/public/products';
import { capitalize } from '@/utils/functions/page';
import { marked } from 'marked';
import Link from 'next/link';
import { Suspense, use } from 'react';
import { BreadCrumb } from './BreadCrumb';
import ProductDownloadCard from './ProductDownloadCard';
import { SingleProductImageCard } from './SingleProductImageCard';

export const SingleProductComponent = ({ params }) => {
  const { id } = use(params);
  const singleProductData = use(getSingleProduct(id));
  const { products: allProductData } = use(getProducts());

  const rawMarkup = marked(singleProductData?.data?.description || '');

  console.log(allProductData);

  return (
    <div className='container mx-auto px-4'>
      {/* Breadcrumb */}
      <div className='mb-6 font-medium'>
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

      {/* Product Image & Download Section */}
      <div className='flex flex-col lg:flex-row gap-10'>
        <div>
          <Suspense fallback={<LoadingSpinner />}>
            <SingleProductImageCard data={singleProductData?.data} />
          </Suspense>
        </div>

        <div className='w-full'>
          <ProductDownloadCard data={singleProductData?.data} />
        </div>
      </div>

      {/* Details & Related Section */}
      <div className='flex flex-col lg:flex-row gap-10 mt-12'>
        {/* Left: Description & Keywords */}
        <div className='w-full lg:w-3/4'>
          {/* Product Details */}
          <div className='mb-10'>
            <h1 className='text-black font-bold text-2xl mb-6'>Item details</h1>
            <pre
              dangerouslySetInnerHTML={{ __html: rawMarkup }}
              className='prose max-w-none break-words whitespace-pre-wrap'
            />
          </div>

          {/* Related Keywords */}
          {Array.isArray(singleProductData?.data?.meta_keywords) && (
            <div className='mt-10'>
              <h2 className='text-black text-lg font-semibold mb-4'>
                Related Keywords
              </h2>
              <div className='flex flex-wrap gap-2'>
                {singleProductData.data.meta_keywords.map((item, index) => (
                  <Link
                    href={`/user/search?searchQuery=${encodeURIComponent(item)}`}
                    key={index}
                    className='bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium capitalize hover:bg-teal-200 hover:text-black transition'
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Recommendations */}
        <div className='w-full lg:w-1/2'>
          <div className='mt-10'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-black text-lg font-semibold'>
                You May Also Like
              </h2>
              <button className='text-sm text-blue-600 hover:underline'>
                See More
              </button>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {allProductData?.slice(0, 8).map((item, index) => (
                <ProductCard item={item} key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Future Section */}
      {/* <SubscribeSearchSection /> */}
    </div>
  );
};
