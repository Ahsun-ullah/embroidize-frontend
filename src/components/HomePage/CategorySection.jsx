"use client";
import Link from "next/link";
import CardSlider from "../Common/CardSlider";

const CategorySection = () => {
  const cardData = [
    {
      avatarSrc: "/blog.jpg",
      title: "Animal ",
    },
    {
      avatarSrc: "/images.jpg",
      title: "Flowers",
    },
    {
      avatarSrc: "/category.jpg",
      title: "Kids",
    },
    {
      avatarSrc: "/category.jpg",
      title: "Travel",
    },
    {
      avatarSrc: "/category.jpg",
      title: "Monogram",
    },
    {
      avatarSrc: "/category.jpg",
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
          className="bg-black rounded-md hover:bg-blue-400 text-white font-normal px-2 text-sm py-1"
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
