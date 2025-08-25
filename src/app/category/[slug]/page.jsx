import Pagination from '@/components/Common/Pagination';
import ProductCard from '@/components/Common/ProductCard';
import Footer from '@/components/user/HomePage/Footer';
import { Header } from '@/components/user/HomePage/Header';
import { BreadCrumb } from '@/features/products/components/BreadCrumb';
import {
  getAllProductsByCategory,
  getSingleCategory,
} from '@/lib/apis/public/category';
import { capitalize } from '@/utils/functions/page';
import { marked } from 'marked';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export async function generateMetadata({ params }) {
  try {
    const response = await getSingleCategory(params?.slug);
    const category = response?.data;
    const canonicalUrl = `https://embroidize.com/category/${category.slug}`;

    return {
      title: category?.meta_title || category?.name,
      description:
        category?.meta_description ||
        'Download high-quality embroidery machine designs for free.',
      alternates: {
        canonical: canonicalUrl,
      },
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
  }
}

export default async function CategoryProducts({ params, searchParams }) {
  const currentPage = parseInt(searchParams?.page) || 1;
  const perPageData = parseInt(searchParams?.limit) || 20;

  const { products: allProducts, totalPages } = await getAllProductsByCategory(
    params?.slug,
    currentPage,
    perPageData,
  );

  const singleCategoryData = await getSingleCategory(params?.slug);

  if (params?.slug !== singleCategoryData?.data?.slug) {
    redirect(`/${singleCategoryData?.data?.slug}`);
  }

  if (!singleCategoryData?.data) {
    return (
      <div className='text-center py-12'>
        <p>category not found.</p>
      </div>
    );
  }

  const rawMarkup = marked(singleCategoryData?.data?.description || '');

  return (
    <>
      <Header />
      <div className='container mx-auto px-4 py-6 flex flex-col gap-4'>
        <h1 className='capitalize text-3xl'>
          {singleCategoryData?.data?.name}
          {/* Embroidery Designs */}
        </h1>
        <BreadCrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Product', href: '/products' },
            {
              label: `${capitalize(singleCategoryData?.data?.name)}`,
              href: `/category/${singleCategoryData?.data?.slug}`,
            },
          ]}
        />
        <div className='flex items-center gap-3 flex-wrap'>
          {singleCategoryData?.data?.subcategories?.map((sub) => (
            <Link
              key={sub?._id}
              href={`/${singleCategoryData?.data?.slug}/${sub?.slug}`}
              prefetch={false}
              className='bg-white text-gray-800 px-3 py-1 rounded-md text-sm font-medium capitalize hover:bg-black hover:text-white transition shadow-2xl'
            >
              {sub?.name.replace(/embroidery designs/gi, '').trim()}
            </Link>
          ))}
        </div>
      </div>
      <div className='flex flex-col justify-between'>
        <section className='text-black my-8 py-6 border-b-2'>
          <div className='container mx-auto px-4'>
            {allProducts.length === 0 ? (
              <p className='text-center text-gray-600'>
                No products found in this category.
              </p>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {allProducts.map((item, index) => (
                  <ProductCard key={index} item={item} />
                ))}
              </div>
            )}
          </div>

          {allProducts.length > 0 && (
            <div className='flex items-center justify-center mt-6'>
              <Pagination
                currentPage={currentPage?.page}
                perPageData={perPageData}
                totalPages={totalPages}
              />
            </div>
          )}
        </section>
        <div className='container'>
          <pre
            dangerouslySetInnerHTML={{ __html: rawMarkup }}
            className='prose max-w-none break-words whitespace-pre-wrap font-sans text-lg'
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
