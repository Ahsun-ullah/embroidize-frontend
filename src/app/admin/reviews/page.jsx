export const dynamic = 'force-dynamic';

import ReviewsWrapper from '@/features/reviews/ReviewsWrapper';
import { getAdminReviews } from '@/lib/apis/protected/adminReviews';

export const metadata = {
  title: 'Manage Reviews',
};

export default async function AdminReviewsPage({ searchParams }) {
  // Next 15 makes searchParams a Promise — reading a property off it directly
  // throws a sync-dynamic-API error. Same shape the other admin pages use.
  const params = await searchParams;

  const search = params?.search || '';
  const page = parseInt(params?.page) || 1;
  const rating = params?.rating || '';
  // ?featured=true narrows the table to the curated pricing-page set, which is
  // the only view where the reorder arrows apply.
  const featured = params?.featured === 'true';

  // The featured view is fetched as a single page. The reorder call posts the
  // ids it can see and numbers them from 1, so a paginated featured list would
  // give page 2 the same positions as page 1. 100 is the backend's per-page cap
  // and far beyond any sane number of testimonials.
  const limit = featured ? 100 : 20;

  const { reviews, pagination, featuredCount, featuredLimit } =
    await getAdminReviews(search, page, limit, rating, featured);

  return (
    <div className='p-4'>
      <ReviewsWrapper
        items={reviews}
        pagination={pagination}
        initialSearch={search}
        initialRating={rating}
        initialFeatured={featured}
        featuredCount={featuredCount}
        featuredLimit={featuredLimit}
      />
    </div>
  );
}
