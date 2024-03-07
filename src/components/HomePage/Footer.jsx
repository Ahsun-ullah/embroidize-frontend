/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";

const Footer = () => {
  return (
    <>
      <footer class=" relative  pt-8 pb-6">
        <div class="container mx-auto px-4">
          <div class=" flex flex-wrap text-left lg:text-left mb-6">
            <div class="w-full lg:w-6/12 px-4">
              <div className="flex">
                <i class="ri-centos-fill text-3xl mr-2"></i>
                <h4 class="text-3xl font-bold text-black">EmbroID</h4>
              </div>
              <h5 class="text-lg mt-0 mb-2 text-blueGray-600">
                EMB provides high-quality design resources for professionals and
                businesses. Hurry! Explore and join our network of over 100K+
                professionals
              </h5>
              <div class="mt-6 lg:mb-0 mb-6">
                <button
                  class="bg-black text-white shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
                  type="button"
                >
                  <i class="ri-twitter-x-fill"></i>
                </button>
                <button
                  class="bg-black text-white shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
                  type="button"
                >
                  <i class="ri-facebook-circle-fill"></i>
                </button>
                <button
                  class="bg-black text-white shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
                  type="button"
                >
                  <i class="ri-instagram-fill"></i>
                </button>
                <button
                  class="bg-black text-white shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
                  type="button"
                >
                  <i class="ri-github-fill"></i>
                </button>
              </div>
            </div>
            <div class="w-full lg:w-6/12 px-4">
              <div class="flex flex-wrap items-top mb-6">
                <div class="w-full lg:w-4/12 px-4 ml-auto">
                  <span class="block uppercase text-blueGray-500 text-sm font-semibold mb-2">
                    Useful Links
                  </span>
                  <ul class="list-unstyled">
                    <li>
                      <Link
                        class="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                        href="https://www.creative-tim.com/presentation?ref=njs-profile"
                      >
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        class="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                        href="https://blog.creative-tim.com?ref=njs-profile"
                      >
                        Blog
                      </Link>
                    </li>
                    <li>
                      <Link
                        class="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                        href="https://www.github.com/creativetimofficial?ref=njs-profile"
                      >
                        Github
                      </Link>
                    </li>
                    <li>
                      <Link
                        class="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                        href="https://www.creative-tim.com/bootstrap-themes/free?ref=njs-profile"
                      >
                        Free Products
                      </Link>
                    </li>
                  </ul>
                </div>
                <div class="w-full lg:w-4/12 px-4">
                  <span class="block uppercase text-blueGray-500 text-sm font-semibold mb-2">
                    Other Resources
                  </span>
                  <ul class="list-unstyled">
                    <li>
                      <Link
                        class="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                        href="https://github.com/creativetimofficial/notus-js/blob/main/LICENSE.md?ref=njs-profile"
                      >
                        MIT License
                      </Link>
                    </li>
                    <li>
                      <Link
                        class="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                        href="https://creative-tim.com/terms?ref=njs-profile"
                      >
                        Terms &amp; Conditions
                      </Link>
                    </li>
                    <li>
                      <Link
                        class="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                        href="https://creative-tim.com/privacy?ref=njs-profile"
                      >
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        class="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                        href="https://creative-tim.com/contact-us?ref=njs-profile"
                      >
                        Contact Us
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <hr class=" border-blue-500" />
          <div class="bg-white flex flex-wrap items-center md:justify-between justify-center mt-4">
            <div class=" w-full md:w-4/12 px-4 mx-auto text-center">
              <div class="flex text-sm font-semibold py-1">
                <strong>EmbroID</strong>
                <p>&copy; 2024. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
