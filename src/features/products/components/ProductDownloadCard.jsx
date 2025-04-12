'use client';

import {
  Button,
  Card,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';

export default function ProductDownloadCard({ data }) {
  return (
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
  );
}
