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
import DOMPurify from 'dompurify';
import Cookies from 'js-cookie';
import { marked } from 'marked';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function ProductDownloadCard({ data }) {
  const router = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [allIsLoading, setAllIsLoading] = useState(false);

  const handleSingleZipFileDownload = async (fileData) => {
    try {
      setIsLoading(true);

      const token = Cookies.get('token');
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

  const rawMarkup = marked(data?.description || '');
  const sanitizedMarkup = DOMPurify.sanitize(rawMarkup);

  return (
    <>
      <Card isFooterBlurred className='flex flex-col w-full p-4 lg:p-10'>
        <h1 className='text-black font-bold mb-8 text-2xl'>
          Machine Embroidery design Machine Embroidery design
        </h1>
        {/* <h1 className='text-black font-bold mb-2'>Select For Download </h1> */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Dropdown className='border w-full bg-black'>
            <DropdownTrigger>
              <Button
                variant='flat'
                className='border w-full bg-black text-white text-xl'
              >
                Free Download
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label='Dynamic Actions'>
              {data?.available_file_types?.map((item, index) => (
                <DropdownItem
                  onClick={() =>
                    handleSingleZipFileDownload({
                      extension: item,
                      id: router?.id,
                    })
                  }
                  key={index}
                >
                  {item}
                </DropdownItem>
              ))}
            </DropdownMenu>
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
      <div className='max-w-3xl mx-auto mt-10'>
        <h1 className='text-black font-bold mb-8 text-2xl'>Item details</h1>
        <div
          dangerouslySetInnerHTML={{ __html: sanitizedMarkup }}
          className='prose max-w-none break-words text-wrap'
        />
        {/* <ReactMarkdown>{edDAta}</ReactMarkdown> */}
        {/* <pre
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(data?.description),
          }}
          className='prose max-w-none break-words text-wrap'
        /> */}
      </div>
    </>
  );
}
