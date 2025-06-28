import Pagination from '@/components/Common/Pagination';
import ProductCard from '@/components/Common/ProductCard';
import Footer from '@/components/user/HomePage/Footer';
import { Header } from '@/components/user/HomePage/Header';
import { BreadCrumb } from '@/features/products/components/BreadCrumb';
import {
  getAllProductsBySubCategory,
  getSingleSubCategory,
} from '@/lib/apis/public/subcategory';
import { capitalize } from '@/utils/functions/page';
import { marked } from 'marked';
import { redirect } from 'next/navigation';

export async function generateMetadata({ params }) {
  try {
    const response = await getSingleSubCategory(params.subCategorySlug);
    const subcategory = response?.data;
    const canonicalUrl = `https://embroidize.com/${subcategory?.category?.slug}/${subcategory?.slug}`;

    return {
      title: subcategory?.meta_title,
      description: subcategory?.meta_description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: subcategory?.meta_title,
        description: subcategory?.meta_description,
        images: [
          {
            url:
              subcategory?.image?.url ||
              'https://embroidize.com/og-banner.jpg ',
            width: 1200,
            height: 630,
            alt: subcategory?.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: subcategory?.meta_title,
        description: subcategory?.meta_description,
        images: [
          subcategory?.image?.url || 'https://embroidize.com/og-banner.jpg',
        ],
      },
    };
  } catch (error) {
    console.error('Metadata fetch failed:', error);
  }
}

export default async function SubCategoryProducts({ params, searchParams }) {
  const categorySlug = params.categorySlug;
  const subCategorySlug = params.subCategorySlug;
  const currentPage = parseInt(searchParams?.page) || 1;
  const perPageData = parseInt(searchParams?.limit) || 20;

  const { products, totalPages } = await getAllProductsBySubCategory(
    subCategorySlug,
    currentPage,
    perPageData,
  );

  const subCategoryData = await getSingleSubCategory(subCategorySlug);
  const subCategory = subCategoryData?.data;

  if (
    categorySlug !== subCategory?.category?.slug ||
    subCategorySlug !== subCategory?.slug
  ) {
    redirect(`/${subCategory?.category?.slug}/${subCategory?.slug}`);
  }

  if (!subCategory) {
    return (
      <div className='text-center py-12'>
        <p>Subcategory not found.</p>
      </div>
    );
  }

  const rawMarkup = marked(subCategory?.description || '');

  return (
    <>
      <Header />
      <div className='container mx-auto px-4 py-6 flex flex-col gap-4'>
        <h1 className='capitalize text-3xl'>
          {subCategory?.name} Embroidery Designs
        </h1>

        <BreadCrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Product', href: '/products' },
            {
              label: capitalize(subCategory?.category?.name),
              href: `/category/${subCategory?.category?.slug}`,
            },
            {
              label: capitalize(subCategory?.name),
              href: `/${subCategory?.category?.slug}/${subCategory?.slug}`,
            },
          ]}
        />

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {products.length === 0 ? (
            <p className='text-center text-gray-600'>
              No products found in this category.
            </p>
          ) : (
            products.map((item, index) => (
              <ProductCard key={index} item={item} />
            ))
          )}
        </div>

        {products.length > 0 && (
          <div className='flex items-center justify-center mt-6'>
            <Pagination
              currentPage={currentPage}
              perPageData={perPageData}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>

      <div className='container'>
        <pre
          dangerouslySetInnerHTML={{ __html: rawMarkup }}
          className='prose max-w-none break-words whitespace-pre-wrap font-sans text-lg'
        />
      </div>

      <Footer />
    </>
  );
}
