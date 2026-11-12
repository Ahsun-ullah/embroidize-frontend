'use client';

import DownloadLimitModal from '@/components/Common/DownloadLimitModal';
import { isAdminOnlyFormat } from '@/utils/adminOnlyFormats';
import { ErrorToast } from '@/components/Common/ErrorToast';
import FavoriteButton from '@/components/Common/FavoriteButton';
import { getDailyVoteStanding } from '@/lib/apis/public/dailyVote';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import PinToPinterestButton from '@/components/Common/PinToPinterestButton';
import SkuFlag from '@/components/Common/SkuFlag';
import { clearAuthToken } from '@/lib/auth';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import { trackUserEvent } from '@/lib/analytics/userEvents';
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
import { Check, Download, RefreshCw } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProUpsellBox from './ProUpsellBox';

export default function ProductDownloadCard({
  data,
  plans = [],
  totalDesigns = null,
}) {
  const pathName = usePathname();
  const router = useRouter();

  // Design page view for the admin tracking pages (signed-in users only; the
  // backend counts repeat views within 30 minutes once).
  useEffect(() => {
    if (data?._id) trackUserEvent('design_view', { productId: data._id });
  }, [data?._id]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showFormatSheet, setShowFormatSheet] = useState(false);
  const [, setIsMobile] = useState(false);
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
  const isSubscribed = [
    'active',
    'cancelling',
    'lifetime',
    'payment_failed',
  ].includes(accessState);
  const isAdmin = userInfoData?.role === 'admin';
  // Daily free-design vote: this design's standing today, and whether it is
  // today's winner. A winner downloads free for everyone signed in, so it must
  // not show the upgrade wall (mirrors the download gate, which lets it through).
  const [voteStanding, setVoteStanding] = useState(null);
  useEffect(() => {
    if (!data?._id) return;
    let live = true;
    getDailyVoteStanding(data._id).then((s) => live && setVoteStanding(s));
    return () => {
      live = false;
    };
  }, [data?._id]);
  const isVoteFreeToday =
    voteStanding?.enabled === true && voteStanding?.isFreeToday === true;

  const isPremium = data?.isFree !== true && !isVoteFreeToday;

  // Download credits cover premium designs when there is no active plan, so a
  // credit holder must NOT be shown the upgrade wall — they have already paid.
  // Mirrors the download gate, which checks credits before refusing.
  const credits = userInfoData?.availableCredits ?? 0;
  const canUseCredits = isPremium && !isSubscribed && credits > 0;

  const needsUpgrade = isPremium && !isSubscribed && !canUseCredits;
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
              // The design's files were replaced after this user took them, so
              // the copy on their machine is the superseded one. Same free
              // re-download, but the message has to say so — "you already have
              // this" tells someone holding a broken file not to bother.
              stale: errorJson?.error?.stale === true,
              filesUpdatedAt: errorJson?.error?.filesUpdatedAt || null,
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

          // Credits ran out of TIME, not quantity. Pushing them at a
          // subscription would be wrong — they already paid, and the fix is to
          // extend the deadline.
          if (
            errorJson?.status === 403 &&
            errorJson?.error?.limitType === 'credits_expired'
          ) {
            ErrorToast(
              'Credits expired',
              errorJson?.error?.message ||
                'Your download credits have expired. Contact us to extend them.',
              8000,
            );
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
      <div className='flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6'>
        {/* SKU pill + favourite. The SKU stays visible to everyone — customers
            quote it to support when reporting an issue with a design. */}
        <div className='flex items-center justify-end gap-2'>
          {data?.sku_code && <SkuFlag sku={data.sku_code} variant='pill' />}
          <FavoriteButton
            productId={data?._id}
            initialCount={data?.favoriteCount || 0}
            variant='detail'
          />
        </div>

        <h1 className='-mt-1 text-2xl font-bold leading-tight text-[#1a1f4e]'>
          {data?.name}
        </h1>

        {/* Rating + Downloads row */}
        <div className='flex flex-wrap items-center gap-x-4 gap-y-1'>
          {/* Rating — clickable, scrolls to reviews */}
          <button
            onClick={() =>
              document
                .getElementById('review-section')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className='group flex items-center gap-1.5'
            title='Go to reviews'
          >
            <div className='flex items-center gap-0.5'>
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  width={18}
                  height={18}
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
            <span className='text-sm font-medium text-gray-800 underline-offset-2 group-hover:underline'>
              {data?.averageRating > 0
                ? Number(data.averageRating).toFixed(1)
                : '—'}{' '}
              ({data?.reviewCount ?? 0}{' '}
              {(data?.reviewCount ?? 0) === 1 ? 'Review' : 'Reviews'})
            </span>
          </button>

          <span className='hidden h-4 w-px bg-gray-300 sm:block' aria-hidden />

          {/* Downloads */}
          <span className='flex items-center gap-1 text-sm font-medium text-gray-800'>
            <i className='ri-download-2-line'></i>
            {formatNumber(data?.downloadCount)} Downloads
          </span>
        </div>

        {/* Show warning banner if Facebook browser */}
        {isFacebookBrowser && (
          <div className='bg-orange-100 border border-orange-400 text-orange-800 px-4 py-3 rounded relative text-sm'>
            <strong className='font-bold'>⚠️ Note: </strong>
            <span>
              Downloads don&apos;t work in Facebook browser. Please open in
              Chrome/Safari.
            </span>
          </div>
        )}

        {showUpgrade ? (
          <ProUpsellBox
            plans={plans}
            totalDesigns={totalDesigns}
            onGetAccess={handleGetAllAccess}
          />
        ) : isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <Button
              variant='flat'
              size='lg'
              className='w-full h-14 rounded-xl bg-neutral-900 text-white font-semibold text-xl'
              onPress={() => setShowFormatSheet(true)}
            >
              <Download color='#ffffff' strokeWidth={3} />{' '}
              {isVoteFreeToday
                ? 'Download Free'
                : isSubscribed || canUseCredits
                  ? 'Download'
                  : 'Free Download'}
            </Button>
            {/* Tell a credit holder what this download will cost them BEFORE
                they click — a silent balance decrement feels like a bug. */}
            {canUseCredits && (
              <p className='-mt-2 text-center text-sm text-gray-600'>
                Uses 1 of your{' '}
                <span className='font-semibold text-black'>{credits}</span>{' '}
                download credit{credits === 1 ? '' : 's'}
              </p>
            )}
          </>
        )}

        {showUpgrade && isAdmin ? (
          <Button
            variant='flat'
            size='lg'
            className='w-full h-14 rounded-xl bg-neutral-900 text-white font-semibold text-xl'
            onPress={() => setShowFormatSheet(true)}
          >
            <Download color='#ffffff' strokeWidth={3} /> Free Download
          </Button>
        ) : (
          ''
        )}

        {data?.product_pdf?.url && (
          <a
            href={data.product_pdf.url}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center justify-center gap-2 rounded-full border-2 border-neutral-900 px-4 py-2.5 text-sm font-bold uppercase text-neutral-900 transition hover:bg-black/5'
            title='Download Product PDF'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              width='20'
              height='20'
              fill='currentColor'
              aria-hidden
            >
              <path d='M3.9985 2C3.44749 2 3 2.44405 3 2.9918V21.0082C3 21.5447 3.44476 22 3.9934 22H20.0066C20.5551 22 21 21.5489 21 20.9925L20.9997 7L16 2H3.9985ZM10.5 7.5H12.5C12.5 9.98994 14.6436 12.6604 17.3162 13.5513L16.8586 15.49C13.7234 15.0421 10.4821 16.3804 7.5547 18.3321L6.3753 16.7191C7.46149 15.8502 8.50293 14.3757 9.27499 12.6534C10.0443 10.9373 10.5 9.07749 10.5 7.5ZM11.1 13.4716C11.3673 12.8752 11.6043 12.2563 11.8037 11.6285C12.2754 12.3531 12.8553 13.0182 13.5102 13.5953C12.5284 13.7711 11.5666 14.0596 10.6353 14.4276C10.8 14.1143 10.9551 13.7948 11.1 13.4716Z' />
            </svg>
            More sewing info (PDF)
          </a>
        )}

        {/* Admin-only: post this product to Pinterest. Renders nothing for
            logged-out visitors and normal users. */}
        <PinToPinterestButton productId={data?._id} className='w-full' />
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
              Facebook&apos;s browser blocks downloads. Please open this page in
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
                  <li>
                    Select &quot;Open in browser&quot; or &quot;Open in
                    Chrome&quot;
                  </li>
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
                    {downloadingType === type ? (
                      'Downloading...'
                    ) : (
                      <span className='flex items-center justify-center gap-2'>
                        {type.toUpperCase()}
                        {/* The API only sends this format to staff, so seeing
                            it at all means the viewer is an admin — label it so
                            it is never mistaken for a customer-facing format. */}
                        {isAdminOnlyFormat(type) && (
                          <span className='rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white'>
                            Admin only
                          </span>
                        )}
                      </span>
                    )}
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
          product={{ name: data?.name, imageUrl: data?.image?.url }}
          onClose={() => setShowLimitModal(false)}
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
              {alreadyOwned.stale ? (
                <RefreshCw className='h-7 w-7' strokeWidth={2.5} aria-hidden />
              ) : (
                <Check className='h-7 w-7' strokeWidth={2.5} aria-hidden />
              )}
            </div>

            <h2
              id='already-owned-title'
              className='text-center text-xl font-bold text-neutral-900 dark:text-white'
            >
              {alreadyOwned.stale
                ? 'This design has been updated'
                : 'You already have this design'}
            </h2>

            {alreadyOwned.stale ? (
              <p className='mx-auto mt-2 text-center text-sm leading-relaxed text-neutral-500 dark:text-neutral-400'>
                We updated the files for{' '}
                <span className='font-semibold text-neutral-800 dark:text-neutral-200'>
                  {alreadyOwned.productName || 'this design'}
                </span>{' '}
                after you downloaded it
                {alreadyOwned.filesUpdatedAt
                  ? ` on ${new Date(alreadyOwned.filesUpdatedAt).toLocaleDateString()}`
                  : ''}
                , so the copy you have is out of date. Get the corrected{' '}
                <span className='font-semibold uppercase text-neutral-800 dark:text-neutral-200'>
                  {alreadyOwned.fileType}
                </span>{' '}
                file from your downloads — it&apos;s free and won&apos;t use any
                of your download limit.
              </p>
            ) : (
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
            )}

            <Button
              onPress={goToMyDownloads}
              isLoading={isGoingToDownloads}
              className='mt-6 h-12 w-full rounded-xl bg-black text-base font-semibold text-white'
            >
              {alreadyOwned.stale
                ? 'Get the updated file'
                : 'Go to my downloads'}
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
