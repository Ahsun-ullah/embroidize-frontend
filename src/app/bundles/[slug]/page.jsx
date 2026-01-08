import Pagination from '@/components/Common/Pagination'; // Adjust path if needed
import ProductCard from '@/components/Common/ProductCard';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getSingleBundle } from '@/lib/apis/protected/bundles';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = params;
  const bundleData = await getSingleBundle(slug);

  if (!bundleData) return {};

  const baseUrl = 'https://embroidize.com';
  const imageUrl = bundleData?.image?.url.startsWith('http')
    ? bundleData.image.url
    : `${baseUrl}${bundleData?.image?.url}`;

  return {
    metadataBase: new URL(baseUrl),
    title: bundleData?.meta_title,
    description: bundleData?.meta_description,
    alternates: {
      canonical: `${baseUrl}/bundles/${bundleData?.slug}`,
    },
    openGraph: {
      title: bundleData?.meta_title,
      description: bundleData?.meta_description,
      url: `${baseUrl}/bundles/${bundleData?.slug}`,
      siteName: 'Embroidize',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: bundleData?.meta_title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: bundleData?.meta_title,
      description: bundleData?.meta_description,
      images: [imageUrl],
    },
  };
}

export default async function SingleBundlePage({ params, searchParams }) {
  const { slug } = params;
  const bundleData = await getSingleBundle(slug);

  if (!bundleData) return notFound();

  // --- Pagination Logic ---
  const perPageData = Number(searchParams?.limit) || 20;
  const currentPage = Number(searchParams?.page) || 1;
  const totalProducts = bundleData?.products?.length || 0;
  const totalPages = Math.ceil(totalProducts / perPageData);

  // Calculate slice range [web:21][web:24]
  const startIndex = (currentPage - 1) * perPageData;
  const endIndex = startIndex + perPageData;
  const paginatedProducts =
    bundleData?.products?.slice(startIndex, endIndex) || [];

  return (
    <>
      <Header />

      <section className='container mx-auto px-4 text-black mb-8 py-6'>
        <h1 className='text-center capitalize text-3xl font-bold mb-4 text-gray-900'>
          {bundleData?.name}
        </h1>

        <div className='flex justify-center mb-10'>
          <img
            src={
              bundleData?.image?.url.startsWith('http')
                ? bundleData.image.url
                : `https://embroidize.com${bundleData?.image?.url}`
            }
            alt={bundleData?.name}
            className='max-w-4xl w-full h-auto rounded-lg shadow-md'
          />
        </div>

        {/* Product Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((item, index) => (
              <ProductCard key={item._id} item={item} index={index} />
            ))
          ) : (
            <div className='col-span-full text-center py-10 text-gray-500'>
              No products found in this bundle.
            </div>
          )}
        </div>

        {/* Pagination Component */}
        <div className='mt-12'>
          <Pagination totalPages={totalPages} perPageData={perPageData} />
        </div>
      </section>

      <Footer />
    </>
  );
}
