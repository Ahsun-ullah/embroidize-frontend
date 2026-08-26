import { Suspense } from 'react';
import FilterBar from './FilterBar';

// Server component on purpose. FilterBar (and the ProductFilters trigger it
// renders) call useSearchParams, which opts whatever sits inside its Suspense
// boundary out of the static HTML — so it is wrapped on its own and `children`
// (the product grid) is deliberately kept OUTSIDE that boundary, or the grid
// would ship as an empty shell.
//
// There is no sidebar: the filter panel slides over the page instead. A 260px
// rail took roughly a third of the width away from every product image, and on
// this catalogue the design itself is what the customer is judging.
function BarSkeleton() {
  return (
    <div className='h-[58px] animate-pulse rounded-xl border border-gray-200 bg-white' />
  );
}

export default function FilterLayout({ facets, total, locked = [], children }) {
  return (
    <div>
      <Suspense fallback={<BarSkeleton />}>
        <FilterBar facets={facets} total={total} locked={locked} />
      </Suspense>
      <div className='mt-6'>{children}</div>
    </div>
  );
}
