import Pagination from '@/components/Common/Pagination';
import ProductCard from '@/components/Common/ProductCard';
import Footer from '@/components/user/HomePage/Footer';
import { Header } from '@/components/user/HomePage/Header';
import { BreadCrumb } from '@/features/products/components/BreadCrumb';
import { getSingleCategory } from '@/lib/apis/public/category';
import { getProducts } from '@/lib/apis/public/products';
import { capitalize } from '@/utils/functions/page';
import Link from 'next/link';

export async function generateMetadata({ searchParams }) {
  const { id } = await searchParams;

  try {
    const response = await getSingleCategory(id);
    const category = response?.data;

    return {
      title: category?.meta_title || category?.name,
      description:
        category?.meta_description ||
        'Download high-quality embroidery machine designs for free.',
      openGraph: {
        title: category?.meta_title || category?.name,
        description:
          category?.meta_description ||
          'Download high-quality embroidery machine designs for free.',
        images: [
          {
            url:
              category?.image?.url || 'https://embroidize.com/home-banner.jpg',
            width: 1200,
            height: 630,
            alt: category?.name || 'Embroidery Design',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: category?.meta_title || category?.name,
        description: category?.meta_description || category?.description,
        images: [
          category?.image?.url || 'https://embroidize.com/og-banner.jpg',
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

export default async function CategoryProducts({ searchParams }) {
  const currentPage = await searchParams;
  const perPageData = 20;
  const searchParamsData = await searchParams;
  const { products: allProducts, totalPages } = await getProducts(
    searchParamsData?.searchQuery,
    currentPage || 0,
    perPageData,
  );
  const singleCategoryData = await getSingleCategory(searchParamsData?.id);

  return (
    <>
      <Header />
      <div className='container mx-auto px-4 py-6 flex flex-col gap-4'>
        <h5 className='capitalize text-3xl'>
          {singleCategoryData?.data?.name} Embroidery Designs
        </h5>
        <BreadCrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Product', href: '/products' },
            {
              label: `${capitalize(singleCategoryData?.data?.name)}`,
              href: `/category/${singleCategoryData?.data?._id}`,
            },
          ]}
        />
        <div>
          {singleCategoryData?.data?.subcategories?.map((sub) => (
            <Link
              key={sub?._id}
              href={`/subcategory/${sub?.name.split(' ').join('-')}?id=${sub?._id}&searchQuery=${sub?.name.split(' ').join('+')}`}
              className='bg-teal-200 text-gray-800 px-3 py-1 rounded-md text-sm font-medium capitalize hover:bg-gray-200 hover:text-black transition'
            >
              {sub?.name}
            </Link>
          ))}
        </div>
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
              currentPage={currentPage?.page}
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
