// Route-level skeleton for /admin/custom-orders. The page itself streams each
// section behind its own Suspense boundary, so this only covers the moment
// before the shell renders — it mirrors the same card shapes.
export default function Loading() {
  return (
    <div className='space-y-10 animate-pulse'>
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

      <div className='rounded-2xl border border-gray-200 bg-white'>
        <div className='flex flex-wrap items-center gap-2 border-b border-gray-100 p-3'>
          <div className='h-8 min-w-[200px] flex-1 rounded-md bg-gray-100' />
          <div className='h-8 w-32 rounded-md bg-gray-100' />
          <div className='h-8 w-24 rounded-md bg-gray-100' />
          <div className='h-8 w-28 rounded-md bg-gray-100' />
        </div>
        {Array.from({ length: 8 }).map((_, r) => (
          <div
            key={r}
            className='flex items-center gap-4 border-b border-gray-50 px-3 py-3 last:border-b-0'
          >
            <div className='h-10 w-10 shrink-0 rounded-lg bg-gray-100' />
            <div className='h-3.5 w-24 rounded bg-gray-100' />
            <div className='h-3.5 w-40 rounded bg-gray-100' />
            <div className='h-3.5 w-32 rounded bg-gray-100' />
            <div className='h-3.5 w-20 rounded bg-gray-100' />
            <div className='ml-auto h-5 w-24 rounded bg-gray-100' />
          </div>
        ))}
      </div>
    </div>
  );
}
