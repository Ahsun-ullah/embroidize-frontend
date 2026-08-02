'use client';

import DownloadLimitModal from '@/components/Common/DownloadLimitModal';
import { ErrorToast } from '@/components/Common/ErrorToast';
import FavoriteButton from '@/components/Common/FavoriteButton';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import PremiumDesignBanner from '@/components/Common/PremiumDesignBanner';
import SkuFlag from '@/components/Common/SkuFlag';
import { clearAuthToken } from '@/lib/auth';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import {
  filenameFromContentDisposition,
  formatNumber,
} from '@/utils/functions/page';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@heroui/react';
import Cookies from 'js-cookie';
import { Check, Download } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProductDownloadCard({ data }) {
  const pathName = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showFormatSheet, setShowFormatSheet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFacebookBrowser, setIsFacebookBrowser] = useState(false);
  const [showFacebookWarning, setShowFacebookWarning] = useState(false);
  const [downloadingType, setDownloadingType] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [limitModalData, setLimitModalData] = useState({
    count: null,
    duration: null,
  });

  const [subscriptionRequired, setSubscriptionRequired] = useState(false);

  // Set when the server refuses a download because this user already has that
  // exact design in that exact format. Drives the banner below, which points
  // them at their download history where the re-download is free.
  const [alreadyOwned, setAlreadyOwned] = useState(null);
  const [isGoingToDownloads, setIsGoingToDownloads] = useState(false);

  const goToMyDownloads = () => {
    if (!alreadyOwned) return;
    setIsGoingToDownloads(true);
    // Seed the history page's search + format filter so the design is already
    // on screen instead of buried in a paginated list.
    const params = new URLSearchParams({
      tabName: 'downloads',
      search: alreadyOwned.productName || '',
      fileType: alreadyOwned.fileType || '',
    });
    router.push(`/user/user-details?${params.toString()}`);
  };

  const { data: userInfoData, refetch: refetchUserInfo } = useUserInfoQuery();

  // accessState is computed server-side (helpers/subscriptionAccess.ts) and is
  // the single label every screen reads. It replaces the status-array check that
  // used to live here: that duplicated the rule, ignored the paid-through date,
  // and so disagreed with what the download endpoint actually allowed.
  const accessState = userInfoData?.accessState;
  const isSubscribed = ['active', 'cancelling', 'lifetime', 'payment_failed'].includes(
    accessState,
  );
  const isAdmin = userInfoData?.role === 'admin';
  const isPremium = data?.isFree !== true;
  const needsUpgrade = isPremium && !isSubscribed;
  const showUpgrade = needsUpgrade || subscriptionRequired;

  const handleGetAllAccess = () => {
    const productPath = data?.slug ? `/product/${data.slug}` : pathName;
    router.push(`/subscriptions?redirect=${encodeURIComponent(productPath)}`);
  };

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isFBApp =
      ua.includes('FBAN') || ua.includes('FBAV') || ua.includes('Instagram');
    setIsFacebookBrowser(isFBApp);
  }, []);

  useEffect(() => {
    const ua = navigator.userAgent;

    const isiOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));

    const isSmallDevice = window.innerWidth < 1025;

    setIsMobile(isiOS || isSmallDevice);
  }, []);

  const formatDuration = (duration) => {
    if (!duration) return '';
    const num = duration.slice(0, -1);
    const unit = duration.slice(-1);
    const units = { d: 'day', h: 'hour', m: 'minute' };
    return `${num} ${units[unit]}${num === '1' ? '' : 's'}`;
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => {
      setLinkCopied(false);
    }, 2000);
  };

  const tryOpenInExternalBrowser = () => {
    const currentUrl = window.location.href;
    const ua = navigator.userAgent;

    if (/Android/.test(ua)) {
      window.location.href = `googlechrome://navigate?url=${encodeURIComponent(currentUrl)}`;

      setTimeout(() => {
        window.location.href = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
      }, 500);
    }

    if (/iPhone|iPad|iPod/.test(ua)) {
      return false;
    }

    return true;
  };

  const safeDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Delay revoke so iOS Safari has time to start the download before the
    // blob URL is invalidated — revoking immediately can abort it on iOS.
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  };

  const handleSingleZipFileDownload = async (fileData) => {
    if (isFacebookBrowser) {
      setShowFormatSheet(false);
      setTimeout(() => {
        setShowFacebookWarning(true);
      }, 300);
      return;
    }

    const token = Cookies.get('token');
    const redirectPath = `/auth/login?pathName=${pathName}?id=${data?._id}`;

    if (!token) {
      window.location.href = redirectPath;
      return;
    }

    try {
      setIsLoading(true);
      setDownloadingType(fileData.extension);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/download/product/${fileData.id}/extension/${fileData.extension}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        // Session expired: the token is present but the server rejected it.
        // Clear the dead token and send them to log in again rather than
        // showing a confusing "Unauthorized Access" toast.
        if (res.status === 401) {
          clearAuthToken();
          window.location.href = redirectPath;
          return;
        }

        let errorMessage = 'Could not download the ZIP file';
        let errorTitle = 'Download Failed';

        try {
          const errorJson = await res.json();

          errorMessage = errorJson?.error?.message || errorMessage;
          errorTitle = errorJson?.message || errorTitle;

          // They already have this exact design in this exact format. Downloads
          // aren't re-served from here — send them to their download history,
          // pre-filtered to that row, where re-downloading is free and doesn't
          // touch their quota. A DIFFERENT format never lands here: the server
          // treats it as a new download.
          if (
            errorJson?.status === 409 &&
            errorJson?.error?.code === 'already_downloaded'
          ) {
            setAlreadyOwned({
              productName: errorJson?.error?.productName || data?.name || '',
              fileType: errorJson?.error?.fileType || fileData.extension,
            });
            setShowFormatSheet(false);
            setIsLoading(false);
            return;
          }

          // A lapsed subscriber gets the modal explaining that their plan ended,
          // not the generic "subscribe" upsell aimed at people who never paid.
          if (
            errorJson?.status === 403 &&
            errorJson?.error?.limitType === 'subscription_expired'
          ) {
            setLimitModalData({
              type: 'subscription_expired',
              planName: errorJson?.error?.planName,
              endedAt: errorJson?.error?.endedAt || null,
            });
            setShowLimitModal(true);
            setShowFormatSheet(false);
            setIsLoading(false);
            return;
          }

          if (
            errorJson?.status === 403 &&
            errorJson?.error?.limitType === 'subscription'
          ) {
            setSubscriptionRequired(true);
            setShowFormatSheet(false);
            setIsLoading(false);
            return;
          }

          if (errorJson?.status === 403 && errorTitle === 'Limit Reached') {
            const limitData = {
              type: errorJson?.error?.limitType,
              count: errorJson?.error?.limit,
              duration: errorJson?.error?.duration || null,
            };

            setLimitModalData(limitData);
            setShowLimitModal(true);
            setIsLoading(false);
            return;
          }
        } catch {
          const errorText = await res.text();
          errorMessage = errorText || errorMessage;
        }

        ErrorToast(errorTitle, errorMessage, 3000);
        setIsLoading(false);
        return;
      }

      const blob = await res.blob();

      const filename = filenameFromContentDisposition(
        res.headers.get('content-disposition'),
        `Embroidize_${fileData.extension}.zip`,
      );

      safeDownload(blob, filename);

      setTimeout(() => {
        refetchUserInfo();
      }, 1200);
    } catch (err) {
      console.error('Download error:', err);
      ErrorToast(
        'Download Failed',
        err?.message || 'Could not download the ZIP file',
        3000,
      );
    } finally {
      setDownloadingType(null);
      setIsLoading(false);
      setShowFormatSheet(false);
    }
  };

  return (
    <>
      <div className='relative flex flex-col p-8 overflow-hidden gap-4 border rounded-3xl bg-white'>
        {data?.sku_code && userInfoData?.role === 'admin' && (
          <SkuFlag sku={data.sku_code} />
        )}

        <div className='flex items-start justify-between gap-3'>
          <h1 className='text-black font-bold text-2xl'>{data?.name}</h1>
          <div className='flex items-center gap-2 flex-shrink-0 mt-1'>
            <FavoriteButton
              productId={data?._id}
              initialCount={data?.favoriteCount || 0}
              variant='detail'
            />
          </div>
        </div>
        <p className='text-gray-600 my-2'>{data?.meta_description}</p>

        {/* Rating + Downloads row */}
        <div className='flex items-center justify-between mb-2'>
          {/* Rating — clickable, scrolls to reviews */}
          <button
            onClick={() =>
              document
                .getElementById('review-section')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className='flex items-center gap-1.5 group'
            title='Go to reviews'
          >
            {/* Stars */}
            <div className='flex items-center gap-0.5'>
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  width={16}
                  height={16}
                  viewBox='0 0 24 24'
                  fill={
                    star <= Math.round(data?.averageRating ?? 0)
                      ? '#F59E0B'
                      : '#E5E7EB'
                  }
                >
                  <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                </svg>
              ))}
            </div>
            <span className='text-sm font-bold text-gray-800'>
              {data?.averageRating > 0
                ? Number(data.averageRating).toFixed(1)
                : '—'}
            </span>
            <span className='text-xs text-gray-400 group-hover:underline'>
              ({data?.reviewCount ?? 0}{' '}
              {(data?.reviewCount ?? 0) === 1 ? 'review' : 'reviews'})
            </span>
          </button>

          {/* Downloads */}
          <span className='font-semibold flex items-center gap-1 text-sm'>
            <i className='ri-download-2-line'></i>
            {formatNumber(data?.downloadCount)} Downloads
          </span>
        </div>

        {/* Show warning banner if Facebook browser */}
        {isFacebookBrowser && (
          <div className='bg-orange-100 border border-orange-400 text-orange-800 px-4 py-3 rounded relative text-sm'>
            <strong className='font-bold'>⚠️ Note: </strong>
            <span>
              Downloads don't work in Facebook browser. Please open in
              Chrome/Safari.
            </span>
          </div>
        )}

        {showUpgrade ? (
          <PremiumDesignBanner onGetAccess={handleGetAllAccess} />
        ) : isLoading ? (
          <LoadingSpinner />
        ) : (
          <Button
            variant='flat'
            size='lg'
            className='border w-full bg-black text-white font-semibold text-xl h-14'
            onPress={() => setShowFormatSheet(true)}
          >
            <Download color='#ffffff' strokeWidth={3} />{' '}
            {isSubscribed ? 'Download' : 'Free Download'}
          </Button>
        )}

        {showUpgrade && isAdmin ? (
          <Button
            variant='flat'
            size='lg'
            className='border w-full bg-black text-white font-semibold text-xl h-14'
            onPress={() => setShowFormatSheet(true)}
          >
            <Download color='#ffffff' strokeWidth={3} /> Free Download
          </Button>
        ) : (
          ''
        )}
      </div>

      {/* Facebook Browser Warning Modal */}
      {showFacebookWarning && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl p-6 max-w-md w-full'>
            <div className='mx-auto mb-4 w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl'>
              🌐
            </div>
            <h2 className='text-xl font-bold mb-3 text-center'>
              Open in Browser Required
            </h2>
            <p className='text-gray-600 mb-4 text-center text-sm'>
              Facebook's browser blocks downloads. Please open this page in
              Chrome or Safari to download your files.
            </p>

            <div className='space-y-3'>
              {/* Try to open automatically (works only on some Android devices) */}
              <Button
                className='w-full bg-blue-600 text-white font-semibold'
                onPress={() => {
                  const opened = tryOpenInExternalBrowser();
                  if (!opened) {
                    // If iOS or failed, copy link
                    copyLinkToClipboard();
                  }
                }}
              >
                Open in Browser
              </Button>

              {/* Manual copy option */}
              <Button
                className='w-full border border-gray-300'
                variant='bordered'
                onPress={copyLinkToClipboard}
              >
                {linkCopied ? (
                  <>
                    <Check size={18} /> Link Copied!
                  </>
                ) : (
                  'Copy Link'
                )}
              </Button>

              {/* Instructions */}
              <div className='bg-gray-50 p-4 rounded-lg text-xs'>
                <p className='font-semibold mb-2 text-gray-800'>
                  How to open in browser:
                </p>
                <ol className='list-decimal list-inside space-y-1 text-gray-600'>
                  <li>Tap the three dots (⋯) at the top/bottom</li>
                  <li>Select "Open in browser" or "Open in Chrome"</li>
                  <li>Download your file from there</li>
                </ol>
              </div>

              <Button
                className='w-full text-gray-600'
                variant='light'
                onPress={() => setShowFacebookWarning(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Format Selection Bottom Sheet */}
      <Modal
        isOpen={showFormatSheet}
        onOpenChange={setShowFormatSheet}
        placement='bottom'
        scrollBehavior='inside'
        hideCloseButton
        classNames={{
          wrapper: 'items-end',
          base: 'rounded-t-2xl max-h-[70vh] relative',
        }}
      >
        <ModalContent className='bg-gray-200 pb-6'>
          {(onClose) => (
            <>
              <button
                onClick={onClose}
                className='absolute top-3 right-3 text-gray-600 hover:text-black z-10 text-2xl'
              >
                ✕
              </button>

              <ModalHeader className='text-lg font-bold'>
                Choose Format
              </ModalHeader>

              <ModalBody>
                {data?.available_file_types?.map((type) => (
                  <Button
                    key={type}
                    className='w-full bg-white hover:bg-white text-lg font-bold'
                    onPress={() =>
                      handleSingleZipFileDownload({
                        extension: type,
                        id: data?._id,
                      })
                    }
                    isDisabled={downloadingType && downloadingType !== type}
                  >
                    {downloadingType === type
                      ? 'Downloading...'
                      : type.toUpperCase()}
                  </Button>
                ))}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Download Limit Modal */}
      {showLimitModal && (
        <DownloadLimitModal
          limitModalData={limitModalData}
          onClose={() => setShowLimitModal(false)}
          formatDuration={formatDuration}
        />
      )}

      {/* Already-downloaded notice. Not an error — they own this file. It tells
          them where it lives and that fetching it again is free. */}
      {alreadyOwned && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
          onClick={() => setAlreadyOwned(null)}
        >
          <div
            role='dialog'
            aria-modal='true'
            aria-labelledby='already-owned-title'
            onClick={(e) => e.stopPropagation()}
            className='w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl dark:bg-neutral-900'
          >
            <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-200'>
              <Check className='h-7 w-7' strokeWidth={2.5} aria-hidden />
            </div>

            <h2
              id='already-owned-title'
              className='text-center text-xl font-bold text-neutral-900 dark:text-white'
            >
              You already have this design
            </h2>

            <p className='mx-auto mt-2 text-center text-sm leading-relaxed text-neutral-500 dark:text-neutral-400'>
              You downloaded{' '}
              <span className='font-semibold text-neutral-800 dark:text-neutral-200'>
                {alreadyOwned.productName || 'this design'}
              </span>{' '}
              in{' '}
              <span className='font-semibold uppercase text-neutral-800 dark:text-neutral-200'>
                {alreadyOwned.fileType}
              </span>{' '}
              before. Get it again from your downloads — it&apos;s free and
              won&apos;t use any of your download limit.
            </p>

            <Button
              onPress={goToMyDownloads}
              isLoading={isGoingToDownloads}
              className='mt-6 h-12 w-full rounded-xl bg-black text-base font-semibold text-white'
            >
              Go to my downloads
            </Button>

            <button
              onClick={() => setAlreadyOwned(null)}
              className='mt-2 w-full rounded-xl py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:text-neutral-400 dark:hover:bg-neutral-800'
            >
              Cancel
            </button>

            <p className='mt-4 text-center text-xs text-neutral-400'>
              Need a different file format? Choose another format on this page —
              that counts as a new download.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
