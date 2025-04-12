'use client';

import { Card } from '@heroui/react';

export const SingleProductImageCard = ({ data }) => {
  return (
    <Card
      isFooterBlurred
      className='w-full h-[400px] md:h-[500px] lg:h-[700px]'
    >
      <img
        alt='Card example background'
        className='z-0 w-full h-full object-cover'
        src={`${data?.image?.url || '/blog.jpg'}`}
      />
    </Card>
  );
};
