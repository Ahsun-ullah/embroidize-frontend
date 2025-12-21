import BundlesTableWrapper from '@/features/products/components/BundlesTableWrapper';
import { getAllBundlesForDashboard } from '@/lib/apis/protected/bundles';

export default async function AllBundleListPage({ searchParams }) {
  const params = await searchParams;

  const page = Number(params?.page) || 1;
  const search = params?.search || '';
  const perPage = 10;

  // Fetch Data on the Server
  const { bundles, pagination } = await getAllBundlesForDashboard(
    search,
    page,
    perPage,
  );


  const columns = [
    { name: 'IMAGE', uid: 'image' },
    { name: 'NAME', uid: 'name' },
    { name: 'PRODUCTS', uid: 'products' },
    { name: 'CREATED BY', uid: 'createdBy' },
    { name: 'CREATED AT', uid: 'createdAt' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  return (
    <>
      <BundlesTableWrapper
        initialData={bundles}
        pagination={pagination}
        columns={columns}
      />
    </>
  );
}
