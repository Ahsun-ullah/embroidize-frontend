"use client";
import Link from "next/link";
import CardSlider from "../Common/CardSlider";

const CategorySection = () => {
  const cardData = [
    {
      avatarSrc: "https://i.pravatar.cc/150?u=a04258114e29026708c",
      title: "Animal ",
    },
    {
      avatarSrc: "https://i.pravatar.cc/150?u=a04258114e29026708c",
      title: "Flowers",
    },
    {
      avatarSrc: "https://i.pravatar.cc/150?u=a04258114e29026708c",
      title: "Kids",
    },
    {
      avatarSrc: "https://i.pravatar.cc/150?u=a04258114e29026708c",
      title: "Travel",
    },
    {
      avatarSrc: "https://i.pravatar.cc/150?u=a04258114e29026708c",
      title: "Monogram",
    },
    {
      avatarSrc: "https://i.pravatar.cc/150?u=a04258114e29026708c",
      title: "Others",
    },
  ];

  return (
    <section className=" text-black my-8 ">
      <div className="flex items-center justify-center mb-6">
        <h3 className="font-semibold mr-4">
          Sign up for 10 free-forever daily downloads and never miss out!
        </h3>
        <Link
          href={""}
          className="bg-black rounded-md hover:bg-blue-400 text-white font-medium px-2"
        >
          Sign Up For Free
        </Link>
      </div>

      <h1 className="flex justify-center text-3xl font-bold mb-6">
        Browse Best Categories
      </h1>
      <div className="flex items-center justify-center ">
        <CardSlider cardData={cardData} />
      </div>
    </section>
  );
};

export default CategorySection;
