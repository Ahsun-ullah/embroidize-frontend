"use client";
import Link from "next/link";
import CardSlider from "../Common/CardSlider";

const CategorySection = () => {
  const cardData = [
    {
      avatarSrc: "/blog.jpg",
      title: "Animal",
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
    <section className="text-black my-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center mb-6">
          <h3 className="font-semibold text-center mb-2">
            Sign up for 10 free-forever daily downloads and never miss out!
          </h3>
          <Link
            href={""}
            className="bg-black rounded-md hover:bg-blue-400 text-white font-normal px-4 py-2 text-sm"
          >
            Sign Up For Free
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-center mb-6">
          Browse Best Categories
        </h1>
        <div className="flex items-center justify-center">
          <CardSlider cardData={cardData} />
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
