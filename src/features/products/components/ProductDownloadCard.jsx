'use client';

import {
  Button,
  Card,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export default function ProductDownloadCard({ data }) {
  const rawMarkup = marked(data?.description || '');
  const sanitizedMarkup = DOMPurify.sanitize(rawMarkup);

  return (
    <>
      <Card isFooterBlurred className='flex flex-col w-full p-4 lg:p-10'>
        <h1 className='text-black font-bold mb-8 text-2xl'>
          Machine Embroidery design Machine Embroidery design
        </h1>
        <h1 className='text-black font-bold mb-2'>Formats</h1>
        <Dropdown className='border w-full'>
          <DropdownTrigger>
            <Button variant='flat' className='border pt-1 w-full'>
              Select Format
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label='Dynamic Actions'>
            {data?.available_file_types?.map((item, index) => (
              <DropdownItem key={index}>{item}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
        <Button
          className='button mt-8 pt-3 text-xl w-full'
          radius='none'
          size='lg'
          variant='light'
        >
          Free Download
        </Button>
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
