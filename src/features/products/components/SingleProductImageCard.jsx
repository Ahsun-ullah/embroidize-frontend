'use client';

import { Card } from '@heroui/react';

export const SingleProductImageCard = ({ data }) => {
  return (
    <Card
      isFooterBlurred
      className='aspect-[3/2] w-full md:w-[688px] md:h-[459px] lg:w-[800px] lg:h-[533px] xl:w-[764px] xl:h-[509px]'
    >
      <img
        alt='Card example background'
        className='z-0 w-full h-full object-cover'
        src={`${data?.image?.url || '/blog.jpg'}`}
      />
    </Card>
  );
};
