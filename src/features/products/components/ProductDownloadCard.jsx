'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { formatNumber } from '@/utils/functions/page';
import {
  Button,
  Card,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@heroui/react';
import Cookies from 'js-cookie';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProductDownloadCard({ data }) {
  const pathName = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [downloadingType, setDownloadingType] = useState(null);
  const [limitModalData, setLimitModalData] = useState({
    count: null,
    duration: null,
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatDuration = (duration) => {
    if (!duration) return '';
    const num = duration.slice(0, -1);
    const unit = duration.slice(-1);
    const units = { d: 'day', h: 'hour', m: 'minute' };
    return `${num} ${units[unit]}${num === '1' ? '' : 's'}`;
  };

  const handleSingleZipFileDownload = async (fileData) => {
    const token = Cookies.get('token');
    const redirectPath = `/auth/login?pathName=${pathName}?id=${data?._id}`;

    if (!token) {
      window.location.href = redirectPath;
      return;
    }

    try {
      setIsLoading(true);
      setDownloadingType(fileData.extension);
      const headers = new Headers({
        Authorization: `Bearer ${token}`,
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/download/product/${fileData.id}/extension/${fileData.extension}`,
        {
          method: 'GET',
          headers,
        },
      );

      if (!res.ok) {
        setDownloadingType(null);
        setIsLoading(false);
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

        setIsLoading(false);

        if (showLimit) {
          setLimitModalData(limitData);
          setShowLimitModal(true);
          return;
        }

        ErrorToast(`${errorTitle}`, errorMessage, 3000);
        return;
      }

      const blob = await res.blob();
      const filename =
        `From_Embroidize_${fileData.extension}.zip` ||
        res.headers.get('Content-Disposition')?.split('filename=')[1] ||
        'download.zip';

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
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
      setShowMobileSheet(false);
    }
  };

  return (
    <>
      <Card isFooterBlurred className='flex flex-col p-8'>
        <h2 className='text-black font-bold text-2xl'>{data?.name}</h2>
        <p className='text-gray-600 my-2'>{data?.meta_description}</p>

        <div className='flex items-center justify-between mb-2'>
          <h2 className='text-black font-bold'>Select For Free Download</h2>
          <span className='font-semibold flex items-center gap-1'>
            <i className='ri-download-2-line' aria-hidden='true'></i>
            {formatNumber(data?.downloadCount)}
          </span>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : isMobile ? (
          // 👉 On Mobile, show bottom sheet
          <Button
            variant='flat'
            className='border w-full bg-black text-white font-semibold text-lg h-12'
            onPress={() => setShowMobileSheet(true)}
          >
            Free Download
          </Button>
        ) : (
          // 👉 On Desktop, use normal dropdown
          <Dropdown portalContainer={document.body}>
            <DropdownTrigger>
              <Button
                variant='flat'
                className='border w-full bg-black text-white font-semibold text-lg h-12'
              >
                Free Download
              </Button>
            </DropdownTrigger>
            {Array.isArray(data?.available_file_types) && (
              <DropdownMenu
                aria-label='Download Formats'
                className='w-full min-w-[200px]'
                itemClasses={{
                  base: 'w-full flex justify-center',
                }}
              >
                {data.available_file_types.map((type) => (
                  <DropdownItem
                    variant='flat'
                    key={type}
                    onPress={() =>
                      handleSingleZipFileDownload({
                        extension: type,
                        id: data?._id,
                      })
                    }
                  >
                    <small className='uppercase font-semibold text-base block w-full text-center'>
                      {type}
                    </small>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            )}
          </Dropdown>
        )}
      </Card>

      {/* 👉 Mobile Bottom Sheet */}
      <Modal
        isOpen={showMobileSheet}
        onOpenChange={setShowMobileSheet}
        placement='bottom'
        scrollBehavior='inside'
        classNames={{
          wrapper: 'items-end',
          base: 'rounded-t-2xl max-h-[70vh]',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='text-lg font-semibold'>
                Choose Format
              </ModalHeader>
              <ModalBody>
                {Array.isArray(data?.available_file_types) &&
                  data.available_file_types.map((type) => (
                    <Button
                      key={type}
                      variant='flat'
                      className='w-full my-1 bg-gray-100 hover:bg-gray-200 text-lg font-semibold'
                      onPress={() =>
                        handleSingleZipFileDownload({
                          extension: type,
                          id: data?._id,
                        })
                      }
                      isDisabled={downloadingType && downloadingType !== type}
                    >
                      {downloadingType === type ? (
                        <span className='flex items-center justify-center gap-2'>
                          Downloading...
                        </span>
                      ) : (
                        type.toUpperCase()
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
        <div className='fixed inset-0 z-50 bg-black/40 flex items-center justify-center'>
          <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center animate-fade-in'>
            <div className='mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl'>
              ⛔
            </div>
            <h2 className='text-2xl font-semibold text-gray-800 mb-2'>
              Download Limit Reached
            </h2>
            <p className='text-gray-600 mb-3'>
              You've reached your limit of{' '}
              <span className='font-semibold text-gray-800'>
                {limitModalData.count}
              </span>{' '}
              downloads within{' '}
              <span className='font-semibold text-gray-800'>
                {formatDuration(limitModalData.duration)}
              </span>
              .
            </p>
            <p className='text-sm text-gray-500 mb-4'>
              Please wait for the limit to reset.
            </p>
            <p className='text-sm text-gray-500 mb-6'>Happy Downloading...</p>
            <button
              className='bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300'
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
