'use client';
import { Input } from '@heroui/react';
import { SearchIcon } from '../icons';

export default function SearchBox() {
  return (
    <div className='w-[650px] max-sm:w-[300px]'>
      <Input
        aria-label='Search'
        classNames={{
          inputWrapper: 'border-1 border-black rounded-full text-black',
          input: 'text-sm text-black',
        }}
        labelPlacement='outside'
        placeholder='Search...'
        startContent={
          <SearchIcon className='text-black  pointer-events-none flex-shrink-0' />
        }
        type='search'
      />
    </div>
  );
}
