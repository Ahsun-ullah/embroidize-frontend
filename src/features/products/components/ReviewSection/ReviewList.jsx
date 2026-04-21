'use client';

import ReviewCard from './ReviewCard';

export default function ReviewList({
  reviews,
  pagination,
  currentUserId,
  onEdit,
  onDelete,
  onLoadMore,
  isLoadingMore,
  isDeleting,
}) {
  if (reviews.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-400 text-sm'>No reviews yet. Be the first to review this design!</p>
      </div>
    );
  }

  const hasMore = pagination && pagination.page < pagination.pages;

  return (
    <div className='flex flex-col gap-3'>
      {reviews.map((review) => (
        <ReviewCard
          key={review._id}
          review={review}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}

      {/* Load More */}
      {hasMore && (
        <div className='flex justify-center mt-2'>
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className='px-6 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50'
          >
            {isLoadingMore ? 'Loading...' : 'Load More Reviews'}
          </button>
        </div>
      )}

      {!hasMore && reviews.length > 0 && (
        <p className='text-center text-xs text-gray-400 mt-2'>All reviews loaded</p>
      )}
    </div>
  );
}
