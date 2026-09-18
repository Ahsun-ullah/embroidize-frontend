import Image from 'next/image';

/* Real customer reviews for the standalone landing pages, from the same
 * curated set the /subscriptions page shows (Content → Reviews in admin, via
 * getFeaturedReviews). The mockups shipped with three empty shells inside a
 * dashed "AWAITING REAL CONTENT" box, because these pages run on paid traffic
 * and an invented testimonial is both a trust problem and an ad-account risk.
 *
 * The card is deliberately compact — avatar, author and stars share one header
 * line, the quote is clamped to three lines, and the stitch-out photos are
 * pinned to the bottom so they line up across a row. The mockup's card stacked
 * all of that vertically and made the section twice as tall as its content.
 * Styling lives in each page's landing.css (.review-card), scoped to that
 * page's wrapper.
 */

/* Initials stand in when the reviewer has no avatar — a broken <img> on a
   testimonial reads as neglect, and most accounts have no profile photo. */
function initialsOf(name) {
  return (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

/* "800+" rather than "809": rounded DOWN to the nearest 100 so the claim is
   always true, and the "+" carries the rest. Same rule as FeaturedReviews. */
function reviewCountPhrase(total) {
  if (total < 100) return total.toLocaleString();
  return `${(Math.floor(total / 100) * 100).toLocaleString()}+`;
}

const STAR_PATH =
  'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z';

function Stars({ rating = 0 }) {
  const value = Math.round(Number(rating) || 0);
  return (
    <div className='stars' aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width='13'
          height='13'
          fill='currentColor'
          viewBox='0 0 24 24'
          aria-hidden='true'
          className={n <= value ? undefined : 'star--off'}
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

export default function LandingReviews({ reviews = [], totalCount = 0 }) {
  if (!reviews.length) return null;

  const showMoreLine = totalCount > reviews.length * 2;

  return (
    <>
      <div className='reviews-grid'>
        {reviews.map((review) => {
          const name = review.author?.name || 'Customer';
          const avatar = review.author?.profile_image;
          // The header's third line: a trust signal, or failing that what they
          // actually stitched. One ellipsised line either way.
          const role = review.isVerifiedDownload
            ? 'Verified download'
            : review.product?.name;

          return (
            <article className='review-card' key={review._id}>
              {/* Header */}
              <div className='review-card__header'>
                <span className='review-card__avatar'>
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar} alt='' />
                  ) : (
                    initialsOf(name)
                  )}
                </span>

                <div className='review-card__author'>
                  <p className='review-card__name'>{name}</p>
                  {role && <p className='review-card__role'>{role}</p>}
                </div>

                <div className='review-card__stars'>
                  <Stars rating={review.rating} />
                </div>
              </div>

              {/* Review */}
              <q className='review-card__text'>{review.reviewText}</q>

              {/* Stitch-out images */}
              {review.images?.length > 0 && (
                <div className='review-card__shots'>
                  {review.images.slice(0, 3).map((image) => (
                    <Image
                      key={image.url}
                      src={image.url}
                      alt={`Stitched result by ${name}`}
                      width={108}
                      height={108}
                    />
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {showMoreLine && (
        <p className='rev-more'>
          <b>{reviewCountPhrase(totalCount)} reviews</b> across the design
          library — these are just a few of them.
        </p>
      )}
    </>
  );
}
