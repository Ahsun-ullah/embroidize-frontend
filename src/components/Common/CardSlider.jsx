"use client";
import Image from "next/image";
import Link from "next/link";
import "swiper/css";
import { A11y, Navigation, Pagination, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const CardSlider = ({ cardData }) => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      spaceBetween={5}
      slidesPerView={5}
      navigation
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
      onSwiper={""}
      onSlideChange={""}
    >
      {cardData.map((card, index) => (
        <SwiperSlide className="p-3" key={index}>
          <Link href={"/categoryProducts/singleCategory"}>
            <div className="flex flex-col items-center justify-center bg-white shadow-medium ">
              <div className="relative w-10/12 h-40">
                <Image
                  src={card?.avatarSrc}
                  className="absolute inset-0 w-full h-full object-cover pt-6"
                  layout="fill"
                  alt="img"
                />
              </div>
              <hr />
              <h4 className="font-bold text-large text-center py-1">
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
