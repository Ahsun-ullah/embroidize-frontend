// Instant skeleton for /admin/custom-orders while the server component fetches
// (stats + orders). Keeps navigation/pagination feeling snappy.
export default function Loading() {
  return (
    <div className='space-y-10 animate-pulse'>
      {/* Headline stat cards */}
      <div className='space-y-4'>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='h-24 rounded-xl border border-gray-200 bg-gray-100'
            />
          ))}
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className='h-16 rounded-xl border border-gray-200 bg-gray-100'
            />
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='h-10 w-full max-w-md rounded-lg bg-gray-200' />
        <div className='h-10 w-36 rounded-lg bg-gray-200' />
        <div className='h-10 w-36 rounded-lg bg-gray-200' />
        <div className='h-10 w-40 rounded-lg bg-gray-200' />
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-xl border border-gray-100'>
        <div className='flex gap-4 border-b border-gray-100 bg-gray-50 p-4'>
          {['w-12', 'w-32', 'w-40', 'w-20', 'w-16', 'w-24', 'w-16'].map(
            (w, i) => (
              <div key={i} className={`h-4 rounded bg-gray-200 ${w}`} />
            ),
          )}
        </div>
        {Array.from({ length: 8 }).map((_, r) => (
          <div
            key={r}
            className='flex items-center gap-4 border-b border-gray-50 p-4'
          >
            <div className='h-10 w-10 rounded-lg bg-gray-100' />
            <div className='h-4 w-32 rounded bg-gray-100' />
            <div className='h-4 w-40 rounded bg-gray-100' />
            <div className='h-4 w-20 rounded bg-gray-100' />
            <div className='h-4 w-16 rounded bg-gray-100' />
            <div className='h-4 w-24 rounded bg-gray-100' />
            <div className='h-4 w-16 rounded bg-gray-100' />
          </div>
        ))}
      </div>
    </div>
  );
}
