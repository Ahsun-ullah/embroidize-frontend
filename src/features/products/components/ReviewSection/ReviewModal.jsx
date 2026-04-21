'use client';

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { useEffect, useState } from 'react';
import StarSelector from './StarSelector';

export default function ReviewModal({ isOpen, onClose, onSubmit, initialData = null, isLoading }) {
  const isEdit = !!initialData;

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingError, setRatingError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRating(initialData?.rating ?? 0);
      setReviewText(initialData?.reviewText ?? '');
      setRatingError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    if (!rating) {
      setRatingError('Please select a rating.');
      return;
    }
    setRatingError('');
    await onSubmit({ rating, reviewText: reviewText.trim() });
  };

  const remaining = 1000 - reviewText.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          {isEdit ? 'Edit Your Review' : 'Write a Review'}
        </ModalHeader>

        <ModalBody className='flex flex-col gap-4'>
          {/* Star selector */}
          <div>
            <p className='text-sm font-medium text-gray-700 mb-2'>Your rating *</p>
            <StarSelector value={rating} onChange={(v) => { setRating(v); setRatingError(''); }} />
            {ratingError && (
              <p className='text-red-500 text-xs mt-1'>{ratingError}</p>
            )}
          </div>

          {/* Review text */}
          <div>
            <p className='text-sm font-medium text-gray-700 mb-2'>Your review (optional)</p>
            <textarea
              className='w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition'
              rows={4}
              placeholder='Share your experience with this design...'
              maxLength={1000}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <p className={`text-xs text-right mt-0.5 ${remaining < 50 ? 'text-orange-500' : 'text-gray-400'}`}>
              {reviewText.length} / 1000
            </p>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant='light' onPress={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
          <Button
            className='bg-amber-400 text-black font-semibold hover:bg-amber-500'
            onPress={handleSubmit}
            isLoading={isLoading}
          >
            {isEdit ? 'Update Review' : 'Submit Review'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
