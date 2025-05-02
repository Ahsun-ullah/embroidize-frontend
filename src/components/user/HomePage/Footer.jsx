import Image from 'next/image';
import Link from 'next/link';
import mainLogo from '../../../../public/logo-black.png';

const Footer = () => {
  return (
    <footer className='py-6 bg-white border-t border-gray-200'>
      <div className='container flex flex-wrap text-left lg:text-left'>
        {/* Logo Section */}
        <div className='w-full lg:w-6/12 pb-6'>
          <Link
            href='/'
            className='relative block w-[160px] h-[80px] sm:w-[120px] sm:h-[60px] md:w-[160px] md:h-[80px]'
            aria-label='Navigate to homepage'
          >
            <Image
              src={mainLogo || ''}
              alt='Company Logo'
              layout='fill'
              sizes='(min-width: 640px) 100px, 120px'
              priority
              className='object-contain'
            />
          </Link>
          <p className='text-lg mt-0 mb-4'>
            EMB provides high-quality design resources for professionals and
            businesses. Hurry! Explore and join our network of over 100K+
            professionals.
          </p>
          <div className='flex items-center justify-start gap-x-2'>
            {/* Social Media Links */}
            <Link href='#' aria-label='twitter-button'>
              <i className='ri-twitter-x-fill rounded-full bg-black text-white p-2 text-base'></i>
            </Link>
            <Link href='#' aria-label='facebook-button'>
              <i className='ri-facebook-circle-fill rounded-full bg-black text-white p-2 text-base'></i>
            </Link>
            <Link href='#' aria-label='instagram-button'>
              <i className='ri-instagram-fill rounded-full bg-black text-white p-2 text-base'></i>
            </Link>
          </div>
        </div>

        {/* Useful Links Section */}
        <div className='w-full lg:w-6/12'>
          <div className='flex flex-wrap items-top mb-6'>
            {/* Useful Links Column */}
            <div className='w-full lg:w-4/12 ml-auto'>
              <span className='block capitalize text-blueGray-500 text-lg font-bold mb-2'>
                Useful Links :
              </span>
              <ul className='list-unstyled'>
                <li>
                  <Link
                    className='text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm'
                    href='/about-us'
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    className='text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm'
                    href='/blog'
                  >
                    Blogs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Other Resources Column */}
            <div className='w-full lg:w-4/12'>
              <span className='block capitalize text-blueGray-500 text-lg font-bold mb-2'>
                Other Resources:
              </span>
              <ul className='list-unstyled'>
                <li>
                  <Link
                    className='text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm'
                    href='/terms-and-conditions'
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    className='text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm'
                    href='/privacy-policy'
                  >
                    Privacy Policy
                  </Link>
                </li>
                {/* <li>
                  <Link
                    className='text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm'
                    href='/contact-us'
                  >
                    Contact Us
                  </Link>
                </li> */}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Divider and Footer Info */}
      <hr className='border-blue-500 my-2' />
      <div className='flex flex-wrap items-center md:justify-between justify-between py-2 px-1'>
        <div className='w-full md:w-4/12 px-4 mx-auto text-center'>
          <strong>EmbroID</strong>
          <p>&copy;2024. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
