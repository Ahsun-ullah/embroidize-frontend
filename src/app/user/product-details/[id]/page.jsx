import { SingleProductComponent } from '@/features/products/components/SingleProductComponent';

export default function ProductDetails({ params }) {
  return (
    <>
      <SingleProductComponent params={params} />
    </>
  );
}
