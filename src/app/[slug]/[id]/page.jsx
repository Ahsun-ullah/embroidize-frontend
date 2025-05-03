import Pagination from '@/components/Common/Pagination';
import ProductCard from '@/components/Common/ProductCard';
import Footer from '@/components/user/HomePage/Footer';
import { Header } from '@/components/user/HomePage/Header';
import { BreadCrumb } from '@/features/products/components/BreadCrumb';
import { getProducts } from '@/lib/apis/public/products';
import { getSingleSubCategory } from '@/lib/apis/public/subcategory';
import { capitalize, queryString, slugify } from '@/utils/functions/page';
import { marked } from 'marked';

export async function generateMetadata({ searchParams }) {
  const id = searchParams?.id;

  try {
    const response = await getSingleSubCategory(id);
    const subcategory = response?.data;

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
              'https://embroidize.com/home-banner.jpg',
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
          subcategory?.image?.url || 'https://embroidize.com/og-banner.jpg',
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
  const currentPage = parseInt(searchParams?.page || '0', 10);
  const perPageData = 20;

  const [productData, subCategoryResponse] = await Promise.all([
    getProducts(searchParams?.searchQuery, currentPage, perPageData),
    getSingleSubCategory(searchParams?.id),
  ]);

  const products = productData?.products || [];
  const totalPages = productData?.totalPages || 0;
  const subCategory = subCategoryResponse?.data;

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
        <h5 className='capitalize text-3xl'>
          {subCategory?.name} Embroidery Designs
        </h5>
        <BreadCrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Product', href: '/products' },
            {
              label: capitalize(subCategory?.category?.name),
              href: `/category/${slugify(subCategory?.category?.name)}?id=${subCategory?.category?._id}&searchQuery=${queryString(subCategory?.category?.name)}`,
            },
            {
              label: capitalize(subCategory?.name),
              href: `/category/${subCategory?._id}`,
            },
          ]}
        />
      </div>

      <section className='text-black my-8 py-6 border-b-2'>
        <div className='container mx-auto px-4'>
          {products.length === 0 ? (
            <p className='text-center text-gray-600'>
              No products found in this category.
            </p>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10'>
              {products.map((item, index) => (
                <ProductCard key={index} item={item} />
              ))}
            </div>
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
      </section>
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
