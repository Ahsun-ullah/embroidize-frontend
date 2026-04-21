'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  createReview,
  deleteReview,
  getMyReview,
  updateReview,
} from '@/lib/apis/protected/reviews';
import { getProductReviews, getReviewSummary } from '@/lib/apis/public/reviews';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import Cookies from 'js-cookie';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReviewList from './ReviewList';
import ReviewModal from './ReviewModal';
import ReviewSummary from './ReviewSummary';

const REVIEWS_PER_PAGE = 10;

function SummarySkeleton() {
  return (
    <div className='bg-white border border-gray-100 rounded-2xl p-5 mb-6 animate-pulse'>
      <div className='flex flex-col md:flex-row gap-6'>
        <div className='flex flex-col items-center gap-2 md:w-32'>
          <div className='h-12 w-16 bg-gray-200 rounded' />
          <div className='h-4 w-24 bg-gray-200 rounded' />
          <div className='h-3 w-16 bg-gray-100 rounded' />
        </div>
        <div className='flex-1 flex flex-col gap-2 justify-center'>
          {[5, 4, 3, 2, 1].map((s) => (
            <div key={s} className='flex items-center gap-2'>
              <div className='w-5 h-3 bg-gray-200 rounded' />
              <div className='flex-1 h-2 bg-gray-200 rounded-full' />
              <div className='w-6 h-3 bg-gray-100 rounded' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewCardSkeleton() {
  return (
    <div className='bg-white border border-gray-100 rounded-2xl p-4 animate-pulse flex flex-col gap-3'>
      <div className='flex items-center gap-3'>
        <div className='w-9 h-9 rounded-full bg-gray-200' />
        <div className='flex flex-col gap-1.5'>
          <div className='h-3 w-28 bg-gray-200 rounded' />
          <div className='h-3 w-20 bg-gray-100 rounded' />
        </div>
      </div>
      <div className='h-3 w-full bg-gray-100 rounded' />
      <div className='h-3 w-3/4 bg-gray-100 rounded' />
    </div>
  );
}

export default function ReviewSection({ productId, initialAvgRating = 0, initialReviewCount = 0 }) {
  const reviewsRef = useRef(null);

  // Auth state
  const token = Cookies.get('token');
  const isLoggedIn = !!token;
  const { data: userInfoData } = useUserInfoQuery(undefined, { skip: !isLoggedIn });
  const currentUserId = userInfoData?._id ?? null;

  // Review list state
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [sort, setSort] = useState('recent');
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Summary state
  const [summary, setSummary] = useState({
    averageRating: initialAvgRating,
    totalReviews: initialReviewCount,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  // My review state
  const [myReview, setMyReview] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch summary ──────────────────────────────────────────────────────────
  const fetchSummary = useCallback(async () => {
    try {
      const res = await getReviewSummary(productId);
      if (res?.success) setSummary(res.data);
    } catch {
      // non-critical
    } finally {
      setIsLoadingSummary(false);
    }
  }, [productId]);

  // ── Fetch a specific page of reviews ─────────────────────────────────────
  const fetchReviews = useCallback(async (pageNum, sortValue) => {
    setIsLoadingReviews(true);
    try {
      const res = await getProductReviews(productId, pageNum, REVIEWS_PER_PAGE, sortValue);
      if (res?.success) {
        setReviews(res.data.reviews);
        setPagination(res.data.pagination);
      }
    } catch {
      // silent
    } finally {
      setIsLoadingReviews(false);
    }
  }, [productId]);

  // ── Fetch my review ───────────────────────────────────────────────────────
  const fetchMyReview = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await getMyReview(productId);
      setMyReview(res?.data ?? null);
    } catch {
      setMyReview(null);
    }
  }, [productId, isLoggedIn]);

  useEffect(() => {
    fetchSummary();
    fetchReviews(1, sort);
    fetchMyReview();
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sort change — reset to page 1 ─────────────────────────────────────────
  const handleSortChange = (newSort) => {
    setSort(newSort);
    fetchReviews(1, newSort);
  };

  // ── Page change — fetch that page, scroll back to list top ────────────────
  const handlePageChange = (newPage) => {
    fetchReviews(newPage, sort);
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Open modal ────────────────────────────────────────────────────────────
  const handleOpenModal = (review) => {
    setEditingReview(review ?? null);
    setModalOpen(true);
  };

  // ── Submit (create or update) ─────────────────────────────────────────────
  const handleSubmit = async ({ rating, reviewText, images = [], removeImages = [] }) => {
    setIsSubmitting(true);
    try {
      if (editingReview) {
        const res = await updateReview(editingReview._id, { rating, reviewText, images, removeImages });
        const updated = res.data.review;
        setReviews((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
        setMyReview(updated);
        setSummary((prev) => ({ ...prev, ...res.data.stats }));
        SuccessToast('Updated', 'Your review has been updated.', 3000);
      } else {
        const res = await createReview(productId, { rating, reviewText, images });
        const created = res.data.review;
        // Prepend to current list and refresh summary; re-fetch page 1 so totals are right
        setMyReview(created);
        setSummary((prev) => ({ ...prev, ...res.data.stats }));
        await fetchReviews(1, sort);
        SuccessToast('Thank you!', 'Your review has been submitted.', 3000);
      }
      setModalOpen(false);
    } catch (err) {
      ErrorToast('Error', err.message || 'Something went wrong.', 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (reviewId) => {
    setIsDeleting(true);
    try {
      const res = await deleteReview(reviewId);
      setMyReview(null);
      setSummary((prev) => ({ ...prev, ...res.data.stats }));
      // Re-fetch current page so pagination stays correct
      const currentPage = pagination?.page ?? 1;
      await fetchReviews(currentPage, sort);
      SuccessToast('Deleted', 'Your review has been removed.', 3000);
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to delete review.', 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className='mt-10'>
      <h2 className='text-xl font-bold text-gray-900 mb-4'>Customer Reviews</h2>

      {/* Summary */}
      {isLoadingSummary ? (
        <SummarySkeleton />
      ) : (
        <ReviewSummary
          averageRating={summary.averageRating}
          totalReviews={summary.totalReviews}
          ratingDistribution={summary.ratingDistribution}
          isLoggedIn={isLoggedIn}
          myReview={myReview}
          onWriteReview={handleOpenModal}
          sort={sort}
          onSortChange={handleSortChange}
          reviewsRef={reviewsRef}
        />
      )}

      {/* Review list */}
      <div ref={reviewsRef}>
        {isLoadingReviews && reviews.length === 0 ? (
          <div className='flex flex-col gap-3'>
            {[1, 2, 3].map((i) => (
              <ReviewCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <ReviewList
            reviews={reviews}
            pagination={pagination}
            currentUserId={currentUserId}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
            isLoadingReviews={isLoadingReviews}
            isDeleting={isDeleting}
          />
        )}
      </div>

      {/* Write/Edit Modal */}
      <ReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingReview}
        isLoading={isSubmitting}
      />
    </section>
  );
}
