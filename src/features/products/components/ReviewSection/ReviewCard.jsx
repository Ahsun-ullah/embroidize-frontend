'use client';

import ConfirmationModal from '@/components/Common/ConfirmationModal';
import Image from 'next/image';
import { useState } from 'react';
import StarRating from './StarRating';

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

// Minimal image lightbox for review photos
function ReviewImageLightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length);
  const next = () => setCurrent((i) => (i + 1) % images.length);

  return (
    <div
      className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center'
      onClick={onClose}
    >
      <div className='relative flex items-center justify-center' onClick={(e) => e.stopPropagation()}>
        <img
          src={images[current].url}
          alt={`Review photo ${current + 1}`}
          className='max-w-[90vw] max-h-[90vh] object-contain rounded-xl'
        />

        {/* Prev */}
        {images.length > 1 && (
          <button
            onClick={prev}
            className='absolute left-[-48px] w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition'
          >
            <svg width={18} height={18} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2.5}>
              <path d='m15 18-6-6 6-6' />
            </svg>
          </button>
        )}

        {/* Next */}
        {images.length > 1 && (
          <button
            onClick={next}
            className='absolute right-[-48px] w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition'
          >
            <svg width={18} height={18} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2.5}>
              <path d='m9 18 6-6-6-6' />
            </svg>
          </button>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <span className='absolute bottom-[-32px] text-white/60 text-sm'>
            {current + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className='absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition'
      >
        <svg width={18} height={18} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2.5}>
          <path d='M18 6 6 18M6 6l12 12' />
        </svg>
      </button>
    </div>
  );
}

export default function ReviewCard({ review, currentUserId, onEdit, onDelete, isDeleting }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const isOwner = currentUserId && review.userId?._id === currentUserId;
  const name = review.userId?.name || 'Anonymous';
  const avatar = review.userId?.profile_image?.url;
  const initials = name.charAt(0).toUpperCase();
  const images = review.images ?? [];

  return (
    <>
      <div className='bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3'>
        {/* Header */}
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-center gap-3'>
            {/* Avatar */}
            <div className='shrink-0'>
              {avatar ? (
                <Image
                  src={avatar}
                  alt={name}
                  width={36}
                  height={36}
                  className='w-9 h-9 rounded-full object-cover'
                />
              ) : (
                <div className='w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm'>
                  {initials}
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div>
              <p className='font-semibold text-sm text-gray-900 leading-tight'>{name}</p>
              <div className='flex items-center gap-2 flex-wrap mt-0.5'>
                <StarRating rating={review.rating} size={14} />
                <span className='text-xs text-gray-400'>{relativeTime(review.createdAt)}</span>
                {review.isEdited && (
                  <span className='text-xs text-gray-400 italic'>(edited)</span>
                )}
              </div>
            </div>
          </div>

          {/* Badges + actions */}
          <div className='flex items-center gap-2 shrink-0'>
            {review.isVerifiedDownload && (
              <span className='flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full'>
                <svg width={11} height={11} viewBox='0 0 24 24' fill='none' stroke='#10B981' strokeWidth={3}>
                  <path d='M20 6L9 17l-5-5' />
                </svg>
                Verified
              </span>
            )}
            {isOwner && (
              <div className='flex items-center gap-1'>
                <button
                  onClick={() => onEdit(review)}
                  className='text-xs text-blue-600 hover:underline font-medium'
                >
                  Edit
                </button>
                <span className='text-gray-300'>·</span>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className='text-xs text-red-500 hover:underline font-medium'
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Review text */}
        {review.reviewText && (
          <p className='text-sm text-gray-700 leading-relaxed'>{review.reviewText}</p>
        )}

        {/* Review images */}
        {images.length > 0 && (
          <div className='flex flex-wrap gap-2 mt-1'>
            {images.map((img, i) => (
              <button
                key={img.public_id}
                onClick={() => setLightboxIndex(i)}
                className='w-20 h-20 rounded-xl overflow-hidden border border-gray-200 hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-amber-300'
              >
                <img
                  src={img.url}
                  alt={`Review image ${i + 1}`}
                  className='w-full h-full object-cover'
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Image lightbox */}
      {lightboxIndex !== null && (
        <ReviewImageLightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          await onDelete(review._id);
          setShowDeleteModal(false);
        }}
        title='Delete Review'
        message='Are you sure you want to delete this review? This action cannot be undone.'
        confirmText='Delete'
        confirmColor='danger'
        isLoading={isDeleting}
      />
    </>
  );
}
