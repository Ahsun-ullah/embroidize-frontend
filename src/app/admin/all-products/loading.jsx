// Shown while the products page is being fetched on the server.
//
// Covers ARRIVING at the page. Filter changes within the page are covered
// separately by the useTransition pending state in ProductsTableWrapper — a
// route-level loading file would replace the whole screen with skeletons on
// every filter click, which loses the user's place and reads as a page reload.
export default function Loading() {
  return (
    <div className='p-6' aria-busy='true' aria-live='polite'>
      <div className='flex items-center justify-between mb-4'>
        <div className='h-6 w-48 rounded bg-gray-200 animate-pulse' />
        <div className='h-8 w-24 rounded bg-gray-200 animate-pulse' />
      </div>

      <div className='flex flex-wrap gap-3 mb-6'>
        <div className='h-10 w-full sm:w-[30%] rounded-xl bg-gray-200 animate-pulse' />
        <div className='h-10 w-full sm:w-[20%] rounded-xl bg-gray-200 animate-pulse' />
        <div className='h-10 w-full sm:w-[20%] rounded-xl bg-gray-200 animate-pulse' />
        <div className='h-10 w-full sm:w-[15%] rounded-xl bg-gray-200 animate-pulse' />
      </div>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className='rounded-xl border border-gray-100 overflow-hidden'
          >
            <div className='aspect-[4/3] bg-gray-200 animate-pulse' />
            <div className='p-3 space-y-2'>
              <div className='h-3 w-3/4 rounded bg-gray-200 animate-pulse' />
              <div className='h-3 w-1/2 rounded bg-gray-200 animate-pulse' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
