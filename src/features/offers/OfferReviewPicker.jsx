'use client';

import { Button, Input, Select, SelectItem, Spinner } from '@heroui/react';
import { ArrowDown, ArrowUp, Plus, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export const MAX_OFFER_REVIEWS = 12;

// Admin reviews (GET /admin/reviews) and the offer's saved picks
// (pickedReviews, public shape) arrive in different shapes; the picker keeps
// one small card shape for both.
export const pickFromAdminReview = (r) => ({
  _id: String(r._id),
  rating: r.rating,
  reviewText: r.reviewText || '',
  author: r.userId?.name || 'Verified customer',
  product: r.productId?.name || '',
  image: r.images?.[0]?.url || null,
});
export const pickFromPublicReview = (r) => ({
  _id: String(r._id),
  rating: r.rating,
  reviewText: r.reviewText || '',
  author: r.author?.name || 'Verified customer',
  product: r.product?.name || '',
  image: r.images?.[0]?.url || null,
});

function Stars({ n }) {
  return (
    <span className='inline-flex items-center gap-0.5 text-xs font-semibold text-gray-800'>
      <Star size={12} className='fill-current' /> {n}
    </span>
  );
}

function ReviewLine({ r, children }) {
  return (
    <div className='flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-2'>
      {r.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.image} alt='' className='h-12 w-12 flex-none rounded object-cover' />
      ) : (
        <div className='h-12 w-12 flex-none rounded bg-gray-100' />
      )}
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-2 text-xs text-gray-500'>
          <Stars n={r.rating} />
          <span className='font-medium text-gray-900'>{r.author}</span>
          {r.product && <span className='truncate'>on {r.product}</span>}
        </div>
        <p className='mt-0.5 line-clamp-2 text-xs text-gray-700'>{r.reviewText || '(no text)'}</p>
      </div>
      <div className='flex flex-none items-center gap-1'>{children}</div>
    </div>
  );
}

/**
 * Choose which reviews the offer's landing page shows, how many, and in what
 * order. Empty = the page shows the first 3 site-wide featured reviews.
 */
export default function OfferReviewPicker({ value, onChange, api }) {
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState('');
  const [withPhoto, setWithPhoto] = useState(false);
  const [state, setState] = useState({ loading: false, rows: [], error: '' });

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setState((s) => ({ ...s, loading: true, error: '' }));
      try {
        const qs = new URLSearchParams({ limit: '40', page: '1' });
        if (search.trim()) qs.set('search', search.trim());
        if (rating) qs.set('rating', rating);
        const data = await api(`/admin/reviews?${qs}`);
        if (!cancelled) setState({ loading: false, rows: data?.reviews || [], error: '' });
      } catch (e) {
        if (!cancelled) setState({ loading: false, rows: [], error: e.message });
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search, rating, api]);

  const chosen = new Set(value.map((r) => r._id));
  const full = value.length >= MAX_OFFER_REVIEWS;
  const results = state.rows
    .map(pickFromAdminReview)
    .filter((r) => !chosen.has(r._id))
    .filter((r) => !withPhoto || r.image);

  const move = (i, d) => {
    const next = [...value];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <section>
      <div className='mb-1 flex items-center justify-between'>
        <h3 className='text-sm font-semibold'>
          Reviews on the landing page{' '}
          <span className='font-normal text-gray-500'>
            ({value.length} of {MAX_OFFER_REVIEWS} max)
          </span>
        </h3>
        {value.length > 0 && (
          <Button size='sm' variant='light' onPress={() => onChange([])}>
            Clear all
          </Button>
        )}
      </div>
      <p className='mb-2 text-xs text-gray-500'>
        Shown in this order. Leave empty to show the first 3 featured reviews from Content → Reviews.
        3, 6 or 9 fill the rows neatly on desktop.
      </p>

      <div className='grid gap-3 lg:grid-cols-2'>
        <div className='space-y-2'>
          <div className='text-xs font-medium text-gray-600'>Chosen</div>
          {value.length === 0 && (
            <div className='rounded-lg border border-dashed border-gray-300 p-3 text-xs text-gray-500'>
              None chosen: the page shows the first 3 featured reviews.
            </div>
          )}
          {value.map((r, i) => (
            <ReviewLine key={r._id} r={r}>
              <span className='w-5 text-center text-xs text-gray-400'>{i + 1}</span>
              <Button isIconOnly size='sm' variant='light' aria-label='Move up' isDisabled={i === 0} onPress={() => move(i, -1)}>
                <ArrowUp size={14} />
              </Button>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                aria-label='Move down'
                isDisabled={i === value.length - 1}
                onPress={() => move(i, 1)}
              >
                <ArrowDown size={14} />
              </Button>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                aria-label='Remove review'
                onPress={() => onChange(value.filter((x) => x._id !== r._id))}
              >
                <X size={14} />
              </Button>
            </ReviewLine>
          ))}
        </div>

        <div className='space-y-2'>
          <div className='flex flex-wrap gap-2'>
            <Input
              size='sm'
              className='min-w-[160px] flex-1'
              placeholder='Search text, design or customer'
              value={search}
              onValueChange={setSearch}
              isClearable
              onClear={() => setSearch('')}
            />
            <Select
              size='sm'
              aria-label='Rating'
              className='w-28'
              selectedKeys={[rating || 'any']}
              onChange={(e) => setRating(e.target.value === 'any' ? '' : e.target.value)}
            >
              {['any', '5', '4', '3', '2', '1'].map((k) => (
                <SelectItem key={k}>{k === 'any' ? 'Any stars' : `${k} stars`}</SelectItem>
              ))}
            </Select>
            <Button
              size='sm'
              variant={withPhoto ? 'solid' : 'flat'}
              className={withPhoto ? 'bg-black text-white' : ''}
              onPress={() => setWithPhoto((v) => !v)}
            >
              With photo
            </Button>
          </div>
          <div className='max-h-[360px] space-y-2 overflow-y-auto pr-1'>
            {state.loading && (
              <div className='flex justify-center py-4'>
                <Spinner size='sm' />
              </div>
            )}
            {state.error && <p className='text-xs text-red-600'>{state.error}</p>}
            {!state.loading && !state.error && results.length === 0 && (
              <p className='text-xs text-gray-500'>No reviews match.</p>
            )}
            {!state.loading &&
              results.map((r) => (
                <ReviewLine key={r._id} r={r}>
                  <Button
                    size='sm'
                    variant='flat'
                    startContent={<Plus size={14} />}
                    isDisabled={full}
                    onPress={() => onChange([...value, r])}
                  >
                    Add
                  </Button>
                </ReviewLine>
              ))}
          </div>
          <p className='text-xs text-gray-500'>Newest first, up to 40 per search.</p>
        </div>
      </div>
    </section>
  );
}
