'use client';

import Image from 'next/image';
import Link from 'next/link';

/* Filled/empty star pair, sized for the testimonial header. */
function Stars({ value = 0 }) {
  return (
    <div
      className='flex items-center gap-0.5'
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width='14'
          height='14'
          viewBox='0 0 24 24'
          fill='currentColor'
          aria-hidden='true'
          className={n <= value ? 'text-black' : 'text-gray-200'}
        >
          <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
        </svg>
      ))}
    </div>
  );
}

/* Initials stand in when the reviewer has no avatar — a broken <img> on a
   testimonial reads as neglect, and most accounts have no profile photo.

   A plain <img>, not next/image: an avatar can be a Google OAuth URL
   (lh3.googleusercontent.com), which is not in next.config remotePatterns, and
   next/image throws on an unconfigured host rather than degrading. Review and
   product images below are ours, so those stay optimised. */
function Avatar({ name, src }) {
  const initials = (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name || 'Customer'}
        className='h-10 w-10 flex-shrink-0 rounded-full object-cover'
      />
    );
  }

  return (
    <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white'>
      {initials}
    </div>
  );
}

/* "2,400+" rather than "2,431": rounded DOWN to the nearest 100 so the claim is
   always true, and the "+" carries the rest. Under 100 it stays exact, because
   "0+" would be absurd and a small honest number reads better than a fake one. */
function reviewCountPhrase(total) {
  if (total < 100) return total.toLocaleString();
  return `${(Math.floor(total / 100) * 100).toLocaleString()}+`;
}

export default function FeaturedReviews({ reviews, totalCount = 0 }) {
  if (!reviews?.length) return null;

  // Only worth saying when there are meaningfully more than the handful shown.
  const showMoreLine = totalCount > reviews.length * 2;

  return (
    <section className='mt-16'>
      <div className='mb-6 text-center'>
        <h2 className='text-2xl font-extrabold tracking-tight text-black md:text-3xl'>
          What our customers stitch
        </h2>
        <p className='mt-2 text-sm text-gray-600'>
          Real reviews from embroiderers using these designs on their machines.
        </p>
      </div>

      {/* Masonry-ish columns: testimonial text varies wildly in length, and a
          fixed grid would leave tall gaps under the short ones. */}
      <div className='columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6'>
        {reviews.map((review) => (
          <figure
            key={review._id}
            className='break-inside-avoid rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md'
          >
            <div className='mb-3 flex items-center gap-3'>
              <Avatar
                name={review.author?.name}
                src={review.author?.profile_image}
              />
              <div className='min-w-0'>
                <figcaption className='truncate text-sm font-bold text-black'>
                  {review.author?.name}
                </figcaption>
                <div className='mt-0.5 flex items-center gap-2'>
                  <Stars value={review.rating} />
                  {review.isVerifiedDownload && (
                    <span className='text-[10px] font-semibold uppercase tracking-wide text-gray-400'>
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <blockquote className='text-sm leading-relaxed text-gray-700'>
              {review.reviewText}
            </blockquote>

            {/* The customer's own stitch-outs — the most persuasive thing on
                the page, so they render full width rather than as thumbnails. */}
            {review.images?.length > 0 && (
              <div className='mt-4 flex gap-2'>
                {review.images.map((img) => (
                  <Image
                    key={img.url}
                    src={img.url}
                    alt={`Stitched result by ${review.author?.name || 'a customer'}`}
                    width={96}
                    height={96}
                    className='h-24 w-24 rounded-lg object-cover'
                  />
                ))}
              </div>
            )}

            {review.product && (
              <Link
                href={`/product/${review.product.slug}`}
                className='mt-4 flex items-center gap-2.5 border-t border-gray-100 pt-3 transition-opacity hover:opacity-70'
              >
                {review.product.image && (
                  <Image
                    src={review.product.image}
                    alt={review.product.name}
                    width={32}
                    height={32}
                    className='h-8 w-8 flex-shrink-0 rounded object-cover'
                  />
                )}
                <span className='min-w-0 flex-1 truncate text-xs font-medium text-gray-600'>
                  {review.product.name}
                </span>
                <span className='flex-shrink-0 text-xs text-gray-400'>→</span>
              </Link>
            )}
          </figure>
        ))}
      </div>

      {showMoreLine && (
        <p className='mt-2 text-center text-sm text-gray-600'>
          <span className='font-bold text-black'>
            {reviewCountPhrase(totalCount)} reviews
          </span>{' '}
          across the design library — these are just a few of them.
        </p>
      )}
    </section>
  );
}
