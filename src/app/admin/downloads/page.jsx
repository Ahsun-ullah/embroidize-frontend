import MostDownloadedProductsTableWrapper from '@/features/dashboard/components/MostDownloadedProductsTableWrapper';
import { getDownloadStats } from '@/lib/apis/protected/users';

export default async function DownloadsPage({ searchParams }) {
  const resolvedParams = await searchParams;

  const page = Number(resolvedParams?.page) || 1;
  const perPage = parseInt(resolvedParams?.perPage || '10', 10);
  const search = resolvedParams?.search || '';
  const startDate = resolvedParams?.startDate || '';
  const endDate = resolvedParams?.endDate || '';

  const statsResponse = await getDownloadStats(
    page,
    perPage,
    search,
    startDate,
    endDate,
  );

  const { data, pagination } = statsResponse;

  console.log(data);

  const columns = [
    { name: 'Product', uid: 'name' },
    { name: 'Category', uid: 'category' },
    { name: 'Subcategory', uid: 'sub_category' },
    { name: 'Downloads', uid: 'downloadCount' },
    { name: 'File Types', uid: 'fileTypes' },
    { name: 'Actions', uid: 'actions' },
  ];

  return (
    <div className='downloads-page p-6'>
      <div className='flex justify-between items-center me-6'>
        <h1 className='text-2xl font-bold mb-4'>All Downloaded Products</h1>
        <div className='mb-4 font-semibold text-lg'>
          Total {pagination?.total || 0} Product Downloads
        </div>
      </div>
      <MostDownloadedProductsTableWrapper
        initialData={data || []}
        columns={columns}
        pageSize={perPage}
        pagination={pagination}
      />
    </div>
  );
}
