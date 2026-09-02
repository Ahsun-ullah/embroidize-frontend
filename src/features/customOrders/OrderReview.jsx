'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { Button, Textarea } from '@heroui/react';
import { useEffect, useRef, useState } from 'react';
import { submitReview } from './ordersApi';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_MB = 10;

// HeroUI Textarea restyled for dark surfaces.
const DARK_TEXTAREA = {
  inputWrapper:
    'bg-white/5 border border-white/10 data-[hover=true]:bg-white/10 group-data-[focus=true]:bg-white/10',
  input: 'text-white placeholder:text-zinc-500',
};

function Stars({ value, onChange, readOnly = false, size = 26, dark = false }) {
  // Grayscale stars on dark surfaces keep the black & white brand; light
  // surfaces keep the conventional amber.
  const fillOn = dark ? '#FFFFFF' : '#F59E0B';
  const fillOff = dark ? 'rgba(255,255,255,0.18)' : '#E5E7EB';
  return (
    <div className='flex items-center gap-1'>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type='button'
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(n)}
          className={readOnly ? 'cursor-default' : 'cursor-pointer'}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <svg
            width={size}
            height={size}
            viewBox='0 0 24 24'
            fill={n <= value ? fillOn : fillOff}
          >
            <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
          </svg>
        </button>
      ))}
    </div>
  );
}

// Review section on the customer's order page. Shown once the order is
// delivered/completed. If the customer already reviewed, shows their rating
// read-only; otherwise a star + comment form. Pass `embedded` to drop the
// bordered card + heading when the parent already provides that chrome.
// Pass `dark` when rendering on a dark surface (checkout page).
export default function OrderReview({
  orderId,
  initialReview,
  onSubmitted,
  embedded = false,
  dark = false,
}) {
  const [review, setReview] = useState(initialReview || null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Object URLs must be released or they leak for the tab's lifetime.
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    // Allow re-selecting the same file after removing it.
    e.target.value = '';
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      ErrorToast(
        'Unsupported file',
        'Please attach a JPG, PNG, GIF or WebP image.',
        4000,
      );
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      ErrorToast(
        'File too large',
        `Please keep the image under ${MAX_IMAGE_MB} MB.`,
        4000,
      );
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!rating) {
      ErrorToast('Rating required', 'Please choose a star rating.', 3000);
      return;
    }
    setSaving(true);
    try {
      const saved = await submitReview(orderId, rating, comment.trim(), image);
      setReview(saved);
      SuccessToast('Thank you!', 'Your review has been submitted.', 4000);
      // Submitting closes the order — refresh so the new status shows.
      onSubmitted?.();
    } catch (err) {
      ErrorToast('Could not submit', err.message, 4000);
    } finally {
      setSaving(false);
    }
  };

  const inner = review ? (
    <div className='flex flex-col gap-2'>
      <Stars value={review.rating} readOnly dark={dark} />
      {review.comment && (
        <p
          className={`whitespace-pre-wrap text-sm ${
            dark ? 'text-zinc-300' : 'text-zinc-700'
          }`}
        >
          {review.comment}
        </p>
      )}
      {review.image?.url && (
        <a href={review.image.url} target='_blank' rel='noopener noreferrer'>
          <img
            src={review.image.url}
            alt='Review photo'
            className={`mt-1 max-h-40 w-auto rounded-lg border object-cover ${
              dark ? 'border-white/10' : 'border-zinc-200'
            }`}
          />
        </a>
      )}
      <p className={`text-xs ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
        Thanks for your feedback — it helps other customers.
      </p>
    </div>
  ) : (
    <div className='flex flex-col gap-3'>
      <Stars value={rating} onChange={setRating} dark={dark} />
      <input
        ref={fileInputRef}
        type='file'
        accept={IMAGE_TYPES.join(',')}
        className='hidden'
        onChange={handlePickImage}
      />
      {imagePreview ? (
        <div className='flex items-start gap-3'>
          <img
            src={imagePreview}
            alt='Selected review photo'
            className={`max-h-32 w-auto rounded-lg border object-cover ${
              dark ? 'border-white/10' : 'border-zinc-200'
            }`}
          />
          <button
            type='button'
            onClick={removeImage}
            className={`text-xs underline ${
              dark
                ? 'text-zinc-400 hover:text-white'
                : 'text-zinc-500 hover:text-black'
            }`}
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          className={`flex w-fit items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs ${
            dark
              ? 'border-white/20 text-zinc-400 hover:border-white/40 hover:text-white'
              : 'border-zinc-300 text-zinc-500 hover:border-zinc-500 hover:text-black'
          }`}
        >
          <svg
            width={16}
            height={16}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <rect x='3' y='3' width='18' height='18' rx='2' />
            <circle cx='8.5' cy='8.5' r='1.5' />
            <path d='m21 15-5-5L5 21' />
          </svg>
          Add a photo (optional)
        </button>
      )}
      <Textarea
        minRows={3}
        maxRows={6}
        placeholder='Tell us about your experience (optional)…'
        value={comment}
        onValueChange={setComment}
        classNames={dark ? DARK_TEXTAREA : undefined}
      />

      <div className='flex justify-end'>
        <Button
          size='sm'
          className={
            dark ? 'bg-white font-medium text-black' : 'bg-black text-white'
          }
          isLoading={saving}
          onPress={handleSubmit}
          isDisabled={!rating}
        >
          Submit review
        </Button>
      </div>
    </div>
  );

  if (embedded) return inner;

  return (
    <div className='mt-6 rounded-xl border border-zinc-200 bg-white p-5'>
      <h2 className='mb-4 text-sm font-bold uppercase tracking-wide text-zinc-500'>
        {review ? 'Your review' : 'Rate your experience'}
      </h2>
      {inner}
    </div>
  );
}
