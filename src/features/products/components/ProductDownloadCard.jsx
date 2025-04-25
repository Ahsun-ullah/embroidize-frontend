'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import {
  Button,
  Card,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import Cookies from 'js-cookie';

import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ProductDownloadCard({ data }) {
  const router = useSearchParams();
  const pathName = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [allIsLoading, setAllIsLoading] = useState(false);

  const productId = router.get('id');

  const handleSingleZipFileDownload = async (fileData) => {
    const token = Cookies.get('token');
    if (!token) {
      window.location.href = `/auth/login?pathName=${pathName}?id=${productId}`;
      return;
    }

    try {
      setIsLoading(true);
      const headers = new Headers();

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/download/product/${fileData.id}/extension/${fileData.extension}`,
        {
          method: 'GET',
          headers,
        },
      );

      if (!res.ok) {
        throw new Error(`Download failed with status ${res.status}`);
      }

      const blob = await res.blob();

      const filename = `From_Embroid_${fileData.extension}.zip`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
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
      setIsLoading(false);
    }
  };

  // for all file download
  // const handleAllFileDownloadZip = async (fileData) => {
  //   try {
  //     setAllIsLoading(true);

  //     const token = Cookies.get('token');
  //     const headers = new Headers();

  //     if (token) {
  //       headers.set('Authorization', `Bearer ${token}`);
  //     }

  //     const res = await fetch(
  //       `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/download/product/${fileData.id}/extension/${fileData.extension}`,
  //       {
  //         method: 'GET',
  //         headers,
  //       },
  //     );

  //     if (!res.ok) {
  //       throw new Error(`Download failed with status ${res.status}`);
  //     }

  //     const blob = await res.blob();

  //     const filename = `From_Embroid_${fileData.extension}.zip`;

  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = filename;
  //     document.body.appendChild(link);
  //     link.click();

  //     // Cleanup
  //     window.URL.revokeObjectURL(url);
  //     document.body.removeChild(link);
  //   } catch (err) {
  //     console.error('Download error:', err);
  //     ErrorToast(
  //       'Download Failed',
  //       err?.message || 'Could not download the ZIP file',
  //       3000,
  //     );
  //   } finally {
  //     setAllIsLoading(false);
  //   }
  // };

  return (
    <>
      <Card isFooterBlurred className='flex flex-col  p-8'>
        <h1 className='text-black font-bold text-2xl'>
          Free Embroidery Machine Design
        </h1>
        <p className='text-gray-600 my-2'>
          Download high-quality embroidery machine designs for free. Get
          creative with our exclusive free collection of embroidery designs.
        </p>
        <h1 className='text-black font-bold mb-2'>Select For Free Download </h1>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Dropdown className='border w-full'>
            <DropdownTrigger>
              <Button
                variant='flat'
                className='border w-full bg-black text-white font-semibold text-lg h-12'
              >
                Free Download
              </Button>
            </DropdownTrigger>
            {Array.isArray(data?.available_file_types) && (
              <DropdownMenu aria-label='Download Formats'>
                {data.available_file_types.map((type) => (
                  <DropdownItem
                    key={type}
                    onClick={() =>
                      handleSingleZipFileDownload({
                        extension: type,
                        id: productId,
                      })
                    }
                  >
                    <small className='uppercase font-semibold text-base'>
                      {type}
                    </small>
                  </DropdownItem>
                ))}
              </DropdownMenu>
            )}
          </Dropdown>
        )}
        {/* {allIsLoading ? (
          <LoadingSpinner />
        ) : (
          <Button
            className='button mt-8 pt-3 text-xl w-full'
            radius='none'
            size='lg'
            variant='light'
            onClick={() =>
              handleAllFileDownloadZip({
                extension: 'all',
                id: router?.id,
              })
            }
          >
            Free Download
          </Button>
        )} */}
      </Card>
    </>
  );
}
