import Image from 'next/image';
import Link from 'next/link';
import 'swiper/css';
import { A11y, Navigation, Pagination, Scrollbar } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

const CardSlider = ({ cardData }) => {
  const slidesPerView = 2;

  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      spaceBetween={5}
      slidesPerView={slidesPerView}
      breakpoints={{
        // when window width is >= 640px
        640: {
          slidesPerView: 3,
        },
        // when window width is >= 768px
        768: {
          slidesPerView: 4,
        },
        // when window width is >= 1024px
        1024: {
          slidesPerView: 5,
        },
      }}
      navigation
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
    >
      {cardData?.length > 0 &&
        cardData.map((card, index) => (
          <SwiperSlide className='p-3' key={index}>
            <Link href={'/user/category-products/single-category'}>
              <div className='flex flex-col items-center justify-center bg-white shadow-medium rounded-lg'>
                <div className='relative w-10/12 h-40'>
                  <Image
                    src={card?.avatarSrc}
                    className='absolute inset-0 w-full h-full object-cover rounded-t-lg'
                    layout='fill'
                    alt='img'
                  />
                </div>
                <hr />
                <h4 className='font-bold text-lg text-center py-2'>
                  {card?.title}
                </h4>
              </div>
            </Link>
          </SwiperSlide>
        ))}
    </Swiper>
  );
};

export default CardSlider;
