// Instant loading skeleton for /admin/users. Next.js shows this immediately on
// navigation while the server component fetches, so the sidebar click feels
// snappy instead of frozen.
export default function Loading() {
  return (
    <div className='flex flex-col gap-3 animate-pulse'>
      {/* Filter bar */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='h-10 w-full max-w-xs rounded-lg bg-gray-200' />
        <div className='h-10 w-36 rounded-lg bg-gray-200' />
        <div className='h-10 w-36 rounded-lg bg-gray-200' />
      </div>

      {/* Table skeleton */}
      <div className='overflow-hidden rounded-xl border border-gray-100'>
        {/* Header */}
        <div className='flex gap-4 border-b border-gray-100 bg-gray-50 p-4'>
          {['w-10', 'w-40', 'w-56', 'w-24', 'w-28', 'w-32', 'w-16'].map(
            (w, i) => (
              <div key={i} className={`h-4 rounded bg-gray-200 ${w}`} />
            ),
          )}
        </div>
        {/* Rows */}
        {Array.from({ length: 10 }).map((_, r) => (
          <div
            key={r}
            className='flex items-center gap-4 border-b border-gray-50 p-4'
          >
            <div className='h-4 w-10 rounded bg-gray-100' />
            <div className='h-4 w-40 rounded bg-gray-100' />
            <div className='h-4 w-56 rounded bg-gray-100' />
            <div className='h-4 w-24 rounded bg-gray-100' />
            <div className='h-4 w-28 rounded bg-gray-100' />
            <div className='h-4 w-32 rounded bg-gray-100' />
            <div className='h-4 w-16 rounded bg-gray-100' />
          </div>
        ))}
      </div>
    </div>
  );
}
