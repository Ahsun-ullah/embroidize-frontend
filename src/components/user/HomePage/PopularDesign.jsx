import ProductUpdates from '@/app/products/ProductUpdates';
import ProductCard from '@/components/Common/ProductCard';
import { getPopularProducts } from '@/lib/apis/public/products';
import Link from 'next/link';

const PopularDesign = async () => {
  const { products: allProducts } = await getPopularProducts('', 1, 8);

  return (
    <>
      <ProductUpdates />
      <section className='bg-blue-50 text-black my-8 py-6'>
        <div className='flex items-center justify-center'>
          <h4 className='text-3xl font-bold text-center'>
            Popular embroidery designs
          </h4>
        </div>
        <div className='flex items-center justify-center mt-4'>
          <h4 className='font-semibold text-center'>
            Browse Our Most Loved Designs.
          </h4>
        </div>
      </section>

      <section className='text-black my-8 py-6'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {allProducts?.length > 0 &&
              allProducts.map((item, index) => (
                <ProductCard key={item._id || index} item={item} />
              ))}
          </div>
          <div className='flex justify-center items-center mt-14'>
            <Link
              href='/products?filter=popular'
              className='bg-black rounded-full hover:bg-blue-400 text-white font-medium px-6 py-2'
            >
              View All
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default PopularDesign;
