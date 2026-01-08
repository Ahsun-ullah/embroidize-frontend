import BundleCard from '@/components/Common/BundleCard';
import Pagination from '@/components/Common/Pagination';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getAllBundlesForDashboard } from '@/lib/apis/protected/bundles';

export const revalidate = 0;

export const metadata = {
  title: 'Embroidery Design Bundles | High-Quality Machine Embroidery Files',
  description:
    'Explore popular embroidery design bundles featuring high-quality, professionally digitized files. Perfect for machine embroidery projects with multiple formats included.',
  alternates: {
    canonical: 'https://embroidize.com/bundles',
  },
  openGraph: {
    title: 'Embroidery Design Bundles | High-Quality Machine Embroidery Files',
    description:
      'Explore popular embroidery design bundles featuring high-quality, professionally digitized files. Perfect for machine embroidery projects with multiple formats included.',
    url: 'https://embroidize.com/bundles',
    type: 'website',
    images: [
      {
        url: 'https://embroidize.com/og-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Embroidize Bundles',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Embroidery Design Bundles | High-Quality Machine Embroidery Files',
    description:
      'Explore popular embroidery design bundles featuring high-quality, professionally digitized files. Perfect for machine embroidery projects with multiple formats included.',
    images: ['https://embroidize.com/og-banner.jpg'],
  },
};

export default async function AllBundles({ searchParams }) {
  const currentPage = parseInt(searchParams?.page) || 1;
  const perPageData = parseInt(searchParams?.limit) || 20;

  // Fetch Data on the Server
  const { bundles, pagination } = await getAllBundlesForDashboard(
    '', // search
    currentPage,
    perPageData,
  );

  const totalPages = pagination?.totalPages || 1;

  return (
    <>
      <Header />

      <div className='container mx-auto px-4 flex flex-col justify-between'>
        <h1 className='text-3xl font-bold my-6 text-gray-900'>
          Browse All Bundle Collections from Embroidize
        </h1>
        <section className='text-black mb-8 py-6'>
          {bundles?.length > 0 ? (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {bundles.map((item, index) => (
                  <BundleCard key={item._id} item={item} index={index} />
                ))}
              </div>
              {/* Pagination Component */}
              <div className='flex items-center justify-center mt-8'>
                <Pagination totalPages={totalPages} perPageData={perPageData} />
              </div>
            </>
          ) : (
            <div className='text-center py-12'>
              <p className='text-xl text-gray-600'>No bundles found.</p>
            </div>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
}
