import ProductCard from '@/components/Common/ProductCard';

import Pagination from '@/components/Common/Pagination';
import Footer from '@/components/user/HomePage/Footer';
import { Header } from '@/components/user/HomePage/Header';
import { BreadCrumb } from '@/features/products/components/BreadCrumb';
import { getProducts } from '@/lib/apis/public/products';
import { getSingleSubCategory } from '@/lib/apis/public/subcategory';
import { capitalize } from '@/utils/functions/page';
import { use } from 'react';

export async function generateMetadata({ searchParams }) {
  const { id } = await searchParams;

  try {
    const response = await getSingleSubCategory(id);
    const subcategory = response?.data;

    console.log(subcategory);

    return {
      title: subcategory?.meta_title || subcategory?.name,
      description:
        subcategory?.meta_description ||
        'Download high-quality embroidery machine designs for free.',
      openGraph: {
        title: subcategory?.meta_title || subcategory?.name,
        description:
          subcategory?.meta_description ||
          'Download high-quality embroidery machine designs for free.',
        images: [
          {
            url:
              subcategory?.image?.url ||
              'https://embro-id.vercel.app/home-banner.jpg',
            width: 1200,
            height: 630,
            alt: subcategory?.name || 'Embroidery Design',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: subcategory?.meta_title || subcategory?.name,
        description: subcategory?.meta_description || subcategory?.description,
        images: [
          subcategory?.image?.url ||
            'https://embro-id.vercel.app/og-banner.jpg',
        ],
      },
    };
  } catch (error) {
    console.error('Metadata fetch failed:', error);

    return {
      title: 'Free Embroidery Machine Design',
      description:
        'Download free embroidery machine designs with high-quality patterns for various fabric types. Get creative with our exclusive free collection of embroidery designs.',
    };
  }
}

export default function CategoryProducts({ searchParams }) {
  const currentPage = parseInt(searchParams?.page || '0', 10);
  const perPageData = 20;
  const searchParamsData = use(searchParams);
  const { products: allProducts, totalPages } = use(
    getProducts(searchParamsData?.searchQuery, currentPage || 0, perPageData),
  );

  const singleSubCategoryData = use(getSingleSubCategory(searchParamsData?.id));

  return (
    <>
      <Header />
      <div className='container mx-auto px-4 py-6 flex flex-col gap-4'>
        <h5 className='capitalize text-3xl'>
          {singleSubCategoryData?.data?.name} Embroidery Designs
        </h5>
        <BreadCrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Product', href: '/products' },
            {
              label: `${capitalize(singleSubCategoryData?.data?.category?.name)}`,
              href: `/category/${singleSubCategoryData?.data?.category?.name.split(' ').join('-')}?id=${singleSubCategoryData?.data?.category?._id}&searchQuery=${singleSubCategoryData?.data?.category?.name.split(' ').join('+')}`,
            },
            {
              label: `${capitalize(singleSubCategoryData?.data?.name)}`,
              href: `/category/${singleSubCategoryData?.data?._id}`,
            },
          ]}
        />
      </div>
      <div className=' flex flex-col justify-between'>
        <section className='text-black my-8 py-6 border-b-2'>
          <div className='container mx-auto px-4'>
            {allProducts.length === 0 ? (
              <p className='text-center text-gray-600'>
                No products found in this category.
              </p>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10'>
                {allProducts.map((item, index) => (
                  <ProductCard key={index} item={item} />
                ))}
              </div>
            )}
          </div>

          <div className='flex items-center justify-center mt-6'>
            <Pagination
              currentPage={currentPage}
              perPageData={perPageData}
              totalPages={totalPages}
            />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
