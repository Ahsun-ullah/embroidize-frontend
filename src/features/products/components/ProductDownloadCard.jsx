'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import SkuFlag from '@/components/Common/SkuFlag';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import { formatNumber } from '@/utils/functions/page';
import {
  Button,
  Card,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@heroui/react';
import Cookies from 'js-cookie';
import { Check, Download } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProductDownloadCard({ data }) {
  const pathName = usePathname();
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

  const { data: userInfoData } = useUserInfoQuery();

  // ---- Detect Facebook/Instagram in-app browser ----
  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isFBApp =
      ua.includes('FBAN') || ua.includes('FBAV') || ua.includes('Instagram');
    setIsFacebookBrowser(isFBApp);
  }, []);

  // ---- Detect ALL mobile / tablet / iPad / iOS ----
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

  // ---- Copy link to clipboard ----
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => {
      setLinkCopied(false);
    }, 2000);
  };

  // ---- Try to open in external browser (best effort) ----
  const tryOpenInExternalBrowser = () => {
    const currentUrl = window.location.href;
    const ua = navigator.userAgent;

    // Method 1: Try Android Chrome intent (only works on real Android devices)
    if (/Android/.test(ua)) {
      // Try Chrome intent
      window.location.href = `googlechrome://navigate?url=${encodeURIComponent(currentUrl)}`;

      // Fallback to generic intent after small delay
      setTimeout(() => {
        window.location.href = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
      }, 500);
    }

    // Method 2: For iOS - no programmatic way, show instructions
    if (/iPhone|iPad|iPod/.test(ua)) {
      // iOS has no way to force open - user must do it manually
      return false;
    }

    return true;
  };

  const safeDownload = (blob, filename) => {
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua);

    if (isiOS) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        const a = document.createElement('a');
        a.href = base64Data;
        a.download = filename;
        a.click();
      };
      reader.readAsDataURL(blob);
      return;
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSingleZipFileDownload = async (fileData) => {
    // Check if using Facebook in-app browser
    if (isFacebookBrowser) {
      setShowFormatSheet(false); // Close format modal first
      setTimeout(() => {
        setShowFacebookWarning(true); // Then show Facebook warning
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
        let errorMessage = 'Could not download the ZIP file';
        let errorTitle = 'Download Failed';
        let showLimit = false;
        let limitData = { count: null, duration: null };

        try {
          const errorJson = await res.json();
          errorMessage = errorJson?.error?.message || errorMessage;
          errorTitle = errorJson?.message;

          if (
            errorTitle === 'Limit reached' &&
            /Download limit of (\d+) per (\d+[dhm]) reached\./.test(
              errorMessage,
            ) &&
            errorJson?.status === 403
          ) {
            showLimit = true;
            const match = errorMessage.match(
              /Download limit of (\d+) per (\d+[dhm]) reached\./,
            );
            if (match) {
              limitData.count = match[1];
              limitData.duration = match[2];
            }
          }
        } catch {
          const errorText = await res.text();
          errorMessage = errorText || errorMessage;
        }

        if (showLimit) {
          setLimitModalData(limitData);
          setShowLimitModal(true);
          setIsLoading(false);
          return;
        }

        ErrorToast(errorTitle, errorMessage, 3000);
        setIsLoading(false);
        return;
      }

      const blob = await res.blob();
      const filename = `Embroidize_${fileData.extension}.zip`;

      safeDownload(blob, filename);
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
      <Card
        isFooterBlurred
        className='relative flex flex-col p-8 overflow-hidden gap-4'
      >
        {data?.sku_code && userInfoData?.role === 'admin' && (
          <SkuFlag sku={data.sku_code} />
        )}

        <h1 className='text-black font-bold text-2xl'>{data?.name}</h1>
        <p className='text-gray-600 my-2'>{data?.meta_description}</p>

        <div className='flex items-center justify-between mb-2'>
          <p className='text-black font-bold'>Select For Free Download</p>
          <span className='font-semibold flex items-center gap-1'>
            <i className='ri-download-2-line'></i>
            {formatNumber(data?.downloadCount)}
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

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Button
            variant='flat'
            size='lg'
            className='border w-full bg-black text-white font-semibold text-xl h-14'
            onPress={() => setShowFormatSheet(true)}
          >
            <Download color='#ffffff' strokeWidth={3} /> Free Download
          </Button>
        )}
      </Card>

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
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl p-8 max-w-xl w-full text-center'>
            <div className='mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl'>
              ⛔
            </div>
            <h2 className='text-2xl font-semibold mb-2'>
              Download Limit Reached
            </h2>
            <p className='text-gray-600 mb-3'>
              You've reached your download limit of{' '}
              <b>{limitModalData.count}</b> downloads per{' '}
              <b>{formatDuration(limitModalData.duration)} (24 hours)</b>.
              Please try again after{' '}
              <b>{formatDuration(limitModalData.duration)}</b>.
            </p>
            <button
              className='bg-primary text-white px-5 py-2 rounded-lg mt-4'
              onClick={() => setShowLimitModal(false)}
            >
              Okay, got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
