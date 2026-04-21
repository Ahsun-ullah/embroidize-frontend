'use client';

export default function RatingDistribution({ distribution = {}, total = 0 }) {
  return (
    <div className='flex flex-col gap-1.5 w-full'>
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[star] ?? 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} className='flex items-center gap-2 text-sm'>
            <span className='w-5 text-right text-gray-600 font-medium'>{star}</span>
            <svg
              width={12}
              height={12}
              viewBox='0 0 24 24'
              fill='#F59E0B'
              className='shrink-0'
            >
              <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
            </svg>
            <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
              <div
                className='h-full rounded-full transition-all duration-500'
                style={{ width: `${pct}%`, backgroundColor: '#F59E0B' }}
              />
            </div>
            <span className='w-6 text-left text-gray-500 text-xs'>{count}</span>
          </div>
        );
      })}
    </div>
  );
}
