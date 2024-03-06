"use client";
import { Avatar, Card, CardBody, CardFooter } from "@nextui-org/react";
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
        <SwiperSlide className="p-8" key={index}>
          <Card className="bg-blue-50 p-2">
            <CardBody className="flex justify-center items-center">
              <Avatar size="lg" src={card.avatarSrc} className="text-large" />
            </CardBody>
            <CardFooter className="flex-col items-center">
              <h4 className="font-bold text-large">{card.title}</h4>
            </CardFooter>
          </Card>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CardSlider;
