import DownloadBreakdownPanel from '@/features/dashboard/components/DownloadBreakdownPanel';
import MostDownloadedProductsTableWrapper from '@/features/dashboard/components/MostDownloadedProductsTableWrapper';
import {
  getDownloadBreakdown,
  getDownloadStats,
} from '@/lib/apis/protected/users';

export default async function DownloadsPage({ searchParams }) {
  const resolvedParams = await searchParams;

  const page = Number(resolvedParams?.page) || 1;
  const perPage = parseInt(resolvedParams?.perPage || '10', 10);
  const search = resolvedParams?.search || '';
  const startDate = resolvedParams?.startDate || '';
  const endDate = resolvedParams?.endDate || '';
  const userTier = resolvedParams?.userTier || '';
  const productTier = resolvedParams?.productTier || '';

  // The breakdown deliberately ignores the tier params: it is the thing you
  // pick a tier FROM, so it must keep showing every tier's share of the range
  // even while the grid below is narrowed to one of them.
  const [statsResponse, breakdown] = await Promise.all([
    getDownloadStats(
      page,
      perPage,
      search,
      startDate,
      endDate,
      userTier,
      productTier,
    ),
    getDownloadBreakdown(startDate, endDate),
  ]);

  const { data, pagination } = statsResponse;

  return (
    <div className='downloads-page p-6'>
      <div className='flex justify-between items-center me-6'>
        <h1 className='text-2xl font-bold mb-4'>All Downloaded Products</h1>
        <div className='mb-4 font-semibold text-lg'>
          Total {pagination?.total || 0} Product Downloads
        </div>
      </div>
      <DownloadBreakdownPanel breakdown={breakdown} />

      <MostDownloadedProductsTableWrapper
        initialData={data || []}
        pageSize={perPage}
        pagination={pagination}
      />
    </div>
  );
}
