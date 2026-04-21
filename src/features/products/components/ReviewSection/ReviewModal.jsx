'use client';

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { useEffect, useRef, useState } from 'react';
import StarSelector from './StarSelector';

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 5;

export default function ReviewModal({ isOpen, onClose, onSubmit, initialData = null, isLoading }) {
  const isEdit = !!initialData;
  const fileInputRef = useRef(null);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingError, setRatingError] = useState('');
  const [imageError, setImageError] = useState('');

  // New files selected by the user (File objects)
  const [newFiles, setNewFiles] = useState([]);
  // Previews for new files { file, previewUrl }
  const [newPreviews, setNewPreviews] = useState([]);
  // Existing images from server (edit mode) { url, public_id }
  const [existingImages, setExistingImages] = useState([]);
  // public_ids marked for removal
  const [toRemove, setToRemove] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setRating(initialData?.rating ?? 0);
      setReviewText(initialData?.reviewText ?? '');
      setRatingError('');
      setImageError('');
      setNewFiles([]);
      setNewPreviews([]);
      setToRemove([]);
      setExistingImages(initialData?.images ?? []);
    }
  }, [isOpen, initialData]);

  // Clean up object URLs on unmount / change
  useEffect(() => {
    return () => newPreviews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
  }, [newPreviews]);

  const totalImages = existingImages.length + newFiles.length;
  const remaining = 1000 - reviewText.length;
  const canAddMore = totalImages < MAX_IMAGES;

  const handleFileChange = (e) => {
    setImageError('');
    const selected = Array.from(e.target.files);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    const validated = [];

    for (const file of selected) {
      if (!validTypes.includes(file.type)) {
        setImageError('Only JPG, PNG, WEBP, GIF, AVIF images are allowed.');
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setImageError(`Each image must be under ${MAX_SIZE_MB}MB.`);
        continue;
      }
      validated.push(file);
    }

    const available = MAX_IMAGES - existingImages.length - newFiles.length;
    const toAdd = validated.slice(0, available);

    if (validated.length > available) {
      setImageError(`You can only add ${MAX_IMAGES} images total.`);
    }

    const previews = toAdd.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setNewFiles((prev) => [...prev, ...toAdd]);
    setNewPreviews((prev) => [...prev, ...previews]);
    // Reset input so same file can be re-selected if removed
    e.target.value = '';
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newPreviews[index].previewUrl);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (publicId) => {
    setExistingImages((prev) => prev.filter((img) => img.public_id !== publicId));
    setToRemove((prev) => [...prev, publicId]);
  };

  const handleSubmit = async () => {
    if (!rating) {
      setRatingError('Please select a rating.');
      return;
    }
    setRatingError('');
    await onSubmit({
      rating,
      reviewText: reviewText.trim(),
      images: newFiles,
      removeImages: toRemove,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg' scrollBehavior='inside'>
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>
          {isEdit ? 'Edit Your Review' : 'Write a Review'}
        </ModalHeader>

        <ModalBody className='flex flex-col gap-5'>
          {/* Star selector */}
          <div>
            <p className='text-sm font-medium text-gray-700 mb-2'>Your rating *</p>
            <StarSelector value={rating} onChange={(v) => { setRating(v); setRatingError(''); }} />
            {ratingError && <p className='text-red-500 text-xs mt-1'>{ratingError}</p>}
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

          {/* Image upload */}
          <div>
            <p className='text-sm font-medium text-gray-700 mb-2'>
              Photos (optional · max {MAX_IMAGES})
            </p>

            <div className='flex flex-wrap gap-2'>
              {/* Existing images (edit mode) */}
              {existingImages.map((img) => (
                <div key={img.public_id} className='relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200'>
                  <img src={img.url} alt='review' className='w-full h-full object-cover' />
                  <button
                    type='button'
                    onClick={() => removeExistingImage(img.public_id)}
                    className='absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition'
                  >
                    <svg width={10} height={10} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={3}>
                      <path d='M18 6 6 18M6 6l12 12' />
                    </svg>
                  </button>
                </div>
              ))}

              {/* New image previews */}
              {newPreviews.map((p, i) => (
                <div key={i} className='relative w-20 h-20 rounded-xl overflow-hidden border border-amber-300'>
                  <img src={p.previewUrl} alt='preview' className='w-full h-full object-cover' />
                  <button
                    type='button'
                    onClick={() => removeNewImage(i)}
                    className='absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition'
                  >
                    <svg width={10} height={10} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={3}>
                      <path d='M18 6 6 18M6 6l12 12' />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Add button */}
              {canAddMore && (
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-amber-400 hover:text-amber-500 transition'
                >
                  <svg width={20} height={20} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2}>
                    <path d='M12 5v14M5 12h14' />
                  </svg>
                  <span className='text-xs'>Add</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type='file'
              accept='image/jpeg,image/png,image/webp,image/gif,image/avif'
              multiple
              className='hidden'
              onChange={handleFileChange}
            />

            {imageError && <p className='text-red-500 text-xs mt-1'>{imageError}</p>}
            <p className='text-xs text-gray-400 mt-1'>
              JPG, PNG, WEBP, GIF · max {MAX_SIZE_MB}MB each · up to {MAX_IMAGES} photos
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
