'use client';

import { Pagination, Spinner } from '@heroui/react';
import ReviewCard from './ReviewCard';

export default function ReviewList({
  reviews,
  pagination,
  currentUserId,
  onEdit,
  onDelete,
  onPageChange,
  isLoadingReviews,
  isDeleting,
}) {
  if (!isLoadingReviews && reviews.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-400 text-sm'>
          No reviews yet. Be the first to review this design!
        </p>
      </div>
    );
  }

  const totalPages = pagination?.pages ?? 1;
  const currentPage = pagination?.page ?? 1;

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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex flex-col items-center gap-2 mt-4'>
          <Pagination
            showControls
            showShadow
            color='primary'
            page={currentPage}
            total={totalPages}
            onChange={onPageChange}
            isDisabled={isLoadingReviews}
          />
          {isLoadingReviews && (
            <div className='flex items-center gap-2 text-sm text-gray-500'>
              <Spinner size='sm' color='primary' />
              <span>Loading reviews...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
