'use client';

import Link from 'next/link';
import RatingDistribution from './RatingDistribution';
import StarRating from './StarRating';

export default function ReviewSummary({
  averageRating,
  totalReviews,
  ratingDistribution,
  isLoggedIn,
  myReview,
  onWriteReview,
  sort,
  onSortChange,
  reviewsRef,
}) {
  return (
    <div className='flex flex-col md:flex-row gap-6 bg-white border border-gray-100 rounded-2xl p-5 mb-6'>
      {/* Left: average + stars */}
      <div className='flex flex-col items-center justify-center gap-1 md:w-32 shrink-0'>
        <span className='text-5xl font-bold text-gray-900'>
          {totalReviews > 0 ? averageRating.toFixed(1) : '—'}
        </span>
        <StarRating rating={averageRating} size={20} />
        <button
          onClick={() => reviewsRef?.current?.scrollIntoView({ behavior: 'smooth' })}
          className='text-xs text-gray-500 hover:underline mt-1'
        >
          {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
        </button>
      </div>

      {/* Divider */}
      <div className='hidden md:block w-px bg-gray-100' />

      {/* Middle: distribution bars */}
      <div className='flex-1 flex items-center'>
        <RatingDistribution distribution={ratingDistribution} total={totalReviews} />
      </div>

      {/* Right: CTA + sort */}
      <div className='flex flex-col gap-3 justify-center md:w-48 shrink-0'>
        {isLoggedIn ? (
          myReview ? (
            <button
              onClick={() => onWriteReview(myReview)}
              className='w-full py-2 px-4 rounded-full border-2 border-amber-400 text-amber-700 font-semibold text-sm hover:bg-amber-50 transition'
            >
              Edit Your Review
            </button>
          ) : (
            <button
              onClick={() => onWriteReview(null)}
              className='w-full py-2 px-4 rounded-full bg-amber-400 text-black font-semibold text-sm hover:bg-amber-500 transition'
            >
              Write a Review
            </button>
          )
        ) : (
          <Link
            href='/auth/login'
            className='w-full py-2 px-4 rounded-full border border-gray-300 text-gray-600 font-medium text-sm text-center hover:bg-gray-50 transition'
          >
            Log in to Write a Review
          </Link>
        )}

        {/* Sort */}
        <div>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className='w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white text-gray-700'
          >
            <option value='recent'>Most Recent</option>
            <option value='oldest'>Oldest</option>
            <option value='highest'>Highest Rating</option>
            <option value='lowest'>Lowest Rating</option>
          </select>
        </div>
      </div>
    </div>
  );
}
