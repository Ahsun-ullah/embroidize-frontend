export const dynamic = 'force-dynamic';

import ReviewsWrapper from '@/features/reviews/ReviewsWrapper';
import { getAdminReviews } from '@/lib/apis/protected/adminReviews';

export const metadata = {
  title: 'Manage Reviews',
};

export default async function AdminReviewsPage({ searchParams }) {
  const search = searchParams?.search || '';
  const page = parseInt(searchParams?.page) || 1;
  const rating = searchParams?.rating || '';

  const { reviews, pagination } = await getAdminReviews(search, page, 20, rating);

  return (
    <div className='p-4'>
      <ReviewsWrapper
        items={reviews}
        pagination={pagination}
        initialSearch={search}
        initialRating={rating}
      />
    </div>
  );
}
