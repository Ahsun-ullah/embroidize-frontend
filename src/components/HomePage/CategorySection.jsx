"use client";
import Link from "next/link";

const CategorySection = () => {
  return (
    <section className="flex flex-col justify-center text-black my-8 ">
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

      <div className="flex justify-center">
        <h1 className="text-3xl font-bold">Browse Best Categories</h1>
        <div className="flex justify-center">
          <div data-slick='{"slidesToShow": 4, "slidesToScroll": 4}'>
            <div>
              <h3>1</h3>
            </div>
            <div>
              <h3>2</h3>
            </div>
            <div>
              <h3>3</h3>
            </div>
            <div>
              <h3>4</h3>
            </div>
            <div>
              <h3>5</h3>
            </div>
            <div>
              <h3>6</h3>
            </div>
          </div>

          {/* <SwiperSlider /> */}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
