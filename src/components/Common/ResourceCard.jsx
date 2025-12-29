import { Divider } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const ResourceCard = React.memo(function ResourceCard({ data }) {
  const imageUrl = data?.image?.url;
  const altText = data?.title;
  const readingTime = Math.ceil(data?.description?.length / 200) || 5;

  return (
    <Link
      href={`/resources/${data?.slug}`}
      prefetch={false}
      className='block bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1'
      aria-label={`Read article: ${altText}`}
    >
      {/* Content Overlay */}
      <div className='bg-black p-4'>
        {/* Title */}
        <h2 className='text-xl font-bold text-white leading-tight mb-4 line-clamp-2 drop-shadow-lg'>
          {altText}
        </h2>

        {/* Author & Date Row */}
        <div className='flex items-center justify-between gap-3'>
          {/* Author Badge */}
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-full flex items-center justify-center bg-white border-2 border-white/30 shadow-lg flex-shrink-0 overflow-hidden'>
              <Image
                src='/favicon.ico'
                alt='Embroidize'
                width={36}
                height={36}
                className='object-contain'
              />
            </div>

            <div className='min-w-0'>
              <p className='text-[10px] text-white/70 font-medium uppercase tracking-wide'>
                Written by
              </p>
              <p className='text-sm font-bold text-white truncate'>
                {data?.author || 'Embroidize Team'}
              </p>
            </div>
          </div>

          {/* Date Badge */}
          <time
            className='flex items-center gap-1.5 px-3 py-1.5 bg-blue-300 text-xs font-semibold rounded-sm shadow-md backdrop-blur-sm flex-shrink-0'
            dateTime={data?.createdAt}
          >
            <svg
              className='w-3.5 h-3.5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
            {new Date(data?.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
        </div>
      </div>

      <Divider className='bg-gray-200' />

      {/* Card Content */}
      <div className='p-4 bg-gray-50'>
        {/* Description */}
        <p
          className='text-sm lg:text-base text-gray-600 leading-relaxed line-clamp-3 mb-4'
          dangerouslySetInnerHTML={{
            __html: `${data.meta_description.slice(0, 150)}...`,
          }}
        />

        {/* Footer Meta */}
        <div className='flex items-center justify-between'>
          {/* Reading Time */}
          <div className='flex items-center gap-2 text-gray-500'>
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <span className='text-xs font-medium'>{readingTime} min read</span>
          </div>

          {/* Read More Arrow */}
          <div className='flex items-center gap-1 text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all'>
            <span>Read More</span>
            <svg
              className='w-4 h-4 transition-transform group-hover:translate-x-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5l7 7-7 7'
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default ResourceCard;
