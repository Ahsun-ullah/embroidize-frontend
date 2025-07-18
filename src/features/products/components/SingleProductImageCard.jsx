'use client';

import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Card } from '@heroui/react';
import Image from 'next/image';
import { useState } from 'react';

export const SingleProductImageCard = ({ data }) => {
  const [isLoading, setIsLoading] = useState(true);

  const imageUrl = data?.image?.url || '/blog.jpg';
  const imageAlt = data?.title || 'Product image';

  return (
    <Card
      isFooterBlurred
      className='relative aspect-[3/2] w-full md:w-[688px] md:h-[459px] lg:w-[800px] lg:h-[533px] xl:w-[764px] xl:h-[509px] overflow-hidden'
    >
      {isLoading && (
        <div className='absolute inset-0 z-10 flex items-center justify-center '>
          <LoadingSpinner />
        </div>
      )}

      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        quality={100}
        sizes='(max-width: 768px) 100vw, 800px'
        className='object-cover transition-opacity duration-300'
        onLoad={() => setIsLoading(false)}
        priority
      />
    </Card>
  );
};
