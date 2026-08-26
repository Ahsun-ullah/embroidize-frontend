import { Suspense } from 'react';
import FilterBar from './FilterBar';
import ProductFilters from './ProductFilters';

// Server component on purpose. ProductFilters and FilterBar call
// useSearchParams, which opts whatever sits inside its Suspense boundary out
// of the static HTML — so each is wrapped individually and `children` (the
// product grid) is deliberately kept OUTSIDE those boundaries, or the grid
// would ship as an empty shell.
function RailSkeleton() {
  return (
    <div className='hidden h-[520px] animate-pulse rounded-xl border border-gray-200 bg-white lg:block' />
  );
}

function BarSkeleton() {
  return (
    <div className='h-[58px] animate-pulse rounded-xl border border-gray-200 bg-white' />
  );
}

export default function FilterLayout({ facets, total, locked = [], children }) {
  return (
    <div className='flex flex-col gap-6 lg:flex-row lg:items-start'>
      <div className='w-full shrink-0 lg:w-[260px]'>
        <Suspense fallback={<RailSkeleton />}>
          <ProductFilters facets={facets} locked={locked} />
        </Suspense>
      </div>

      <div className='min-w-0 flex-1'>
        <Suspense fallback={<BarSkeleton />}>
          <FilterBar facets={facets} total={total} locked={locked} />
        </Suspense>
        <div className='mt-6'>{children}</div>
      </div>
    </div>
  );
}
