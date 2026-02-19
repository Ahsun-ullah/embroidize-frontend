import BundleCard from '@/components/Common/BundleCard';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import Link from 'next/link';
import { Suspense } from 'react';

const RecentBundleSection = ({ recentBundles }) => {
  const { bundles: allBundles } = recentBundles;

  return (
    <>
      <section className='text-black my-8 py-6'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            <Suspense fallback={<LoadingSpinner />}>
              {allBundles?.length > 0 &&
                allBundles.map((item, index) => (
                  <BundleCard key={item._id} item={item} index={index} />
                ))}
            </Suspense>
          </div>
         
          <div className='text-center mt-12'>
          <Link
            href={'/bundles'}
              prefetch={false}
            className='inline-flex items-center justify-center rounded-full bg-black px-8 py-4 text-base font-bold text-white hover:bg-gray-800 transition-all'
          >
            View All Bundles →
          </Link>
        </div>
        </div>
      </section>
    </>
  );
};

export default RecentBundleSection;
