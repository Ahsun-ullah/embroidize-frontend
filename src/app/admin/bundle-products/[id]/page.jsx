import BundleDetailsWrapper from '@/features/products/components/BundleDetailsWrapper';
import { getSingleBundle } from '@/lib/apis/protected/bundles';

export default async function SingleBundlePage({ params }) {
  const { id } = await params;

  const bundle = await getSingleBundle(id);

  console.log(bundle);

  //   if (!bundle) {
  //     notFound();
  //   }

  return (
    <div className='container mx-auto p-6'>
      <BundleDetailsWrapper bundle={bundle} />
    </div>
  );
}
