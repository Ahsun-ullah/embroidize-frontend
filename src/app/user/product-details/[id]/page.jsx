import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { SingleProductComponent } from '@/features/products/components/SingleProductComponent';
import { Suspense } from 'react';

export default function ProductDetails({ params }) {
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
      
        <SingleProductComponent params={params} />
      </Suspense>
    </>
  );
}
