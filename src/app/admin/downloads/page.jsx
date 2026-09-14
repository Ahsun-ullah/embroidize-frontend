import DownloadBreakdownPanel from '@/features/dashboard/components/DownloadBreakdownPanel';
import MostDownloadedProductsTableWrapper from '@/features/dashboard/components/MostDownloadedProductsTableWrapper';
import {
  getDownloadBreakdown,
  getDownloadStats,
  getFavoriteStats,
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

  // Which metric the grid ranks by. Downloads is the default; 'favorites'
  // swaps in the favourites aggregation, which takes the SAME date range so
  // the presets and the date inputs keep meaning one thing on this page.
  const isFavorites = resolvedParams?.metric === 'favorites';

  // The breakdown deliberately ignores the tier params: it is the thing you
  // pick a tier FROM, so it must keep showing every tier's share of the range
  // even while the grid below is narrowed to one of them.
  //
  // It is a downloads breakdown only — favourite rows carry no tier stamp — so
  // in favourites mode it is not fetched or shown at all rather than left on
  // screen describing a different number than the grid.
  const [statsResponse, breakdown] = await Promise.all([
    isFavorites
      ? getFavoriteStats(page, perPage, search, startDate, endDate)
      : getDownloadStats(
          page,
          perPage,
          search,
          startDate,
          endDate,
          userTier,
          productTier,
        ),
    isFavorites ? null : getDownloadBreakdown(startDate, endDate),
  ]);

  const { data, pagination } = statsResponse;

  return (
    <div className='downloads-page p-6'>
      <div className='flex justify-between items-center me-6'>
        <h1 className='text-2xl font-bold mb-4'>
          {isFavorites ? 'Most Favourited Products' : 'All Downloaded Products'}
        </h1>
        <div className='mb-4 font-semibold text-lg'>
          Total {pagination?.total || 0}{' '}
          {isFavorites ? 'Favourited Products' : 'Product Downloads'}
        </div>
      </div>
      {!isFavorites && <DownloadBreakdownPanel breakdown={breakdown} />}

      <MostDownloadedProductsTableWrapper
        initialData={data || []}
        pageSize={perPage}
        pagination={pagination}
        metric={isFavorites ? 'favorites' : 'downloads'}
      />
    </div>
  );
}
