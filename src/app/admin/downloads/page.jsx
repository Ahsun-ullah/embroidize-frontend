import MostDownloadedProductsTableWrapper from '@/features/dashboard/components/MostDownloadedProductsTableWrapper';
import { getDownloadStats } from '@/lib/apis/protected/users';

export default async function DownloadsPage({ searchParams }) {
  const page = parseInt(searchParams.page || '1', 10);
  const perPage = parseInt(searchParams.perPage || '10', 10);

  const statsResponse = await getDownloadStats(page, perPage);
  const { data, pagination } = statsResponse;

  const columns = [
    { name: 'Product', uid: 'name' },
    { name: 'Category', uid: 'category' },
    { name: 'Subcategory', uid: 'sub_category' },
    { name: 'Downloads', uid: 'totalDownloads' },
    { name: 'File Types', uid: 'fileTypes' },
    { name: 'Actions', uid: 'actions' },
  ];

  const searchableFieldsName = ['name', 'category', 'sub_category'];

  return (
    <div className='downloads-page p-6'>
      <div className='flex justify-between items-center me-6'>
        <h1 className='text-2xl font-bold mb-4'>Downloads</h1>
        <div className='mb-4 font-semibold text-lg'>
          Found {pagination?.total} results
        </div>
      </div>
      <MostDownloadedProductsTableWrapper
        initialData={data}
        columns={columns}
        pageSize={perPage}
        searchableFieldsName={searchableFieldsName}
        pagination={pagination}
      />
    </div>
  );
}
