import Image from 'next/image';
import Link from 'next/link';
import mainLogo from '../../../../public/logo-black.png';

const Footer = () => {
  return (
    <footer className='py-6 bg-[#f9f9f9] text-gray-700 mt-12]'>
      <div className='container flex flex-wrap text-left lg:text-left'>
        {/* Logo Section */}
        <div className='w-full lg:w-6/12 pb-6'>
          <Link
            href='/'
            prefetch={false}
            className='relative block w-[160px] h-[80px] sm:w-[120px] sm:h-[60px] md:w-[160px] md:h-[80px]'
            aria-label='Navigate to homepage'
          >
            <Image
              src={mainLogo || ''}
              alt='Company Logo'
              fill
              sizes='(min-width: 640px) 100px, 120px'
              priority
              className='object-contain'
            />
          </Link>
          <p className='text-lg mt-0 mb-4'>
            Download free embroidery designs instantly – Browse unlimited
            machine embroidery Design in multiple categories and styles. All
            designs are tested and come in the most popular formats
          </p>
          <div className='flex items-center justify-start gap-x-2'>
            {/* Social Media Links */}
            <Link
              href='https://www.linkedin.com/company/embroidize-official/'
              target='_blank'
              aria-label='linkedin-button'
            >
              <i className='ri-linkedin-fill rounded-full bg-black text-white p-2 text-base'></i>
            </Link>
            <Link
              href='https://www.pinterest.com/embroidize/'
              target='_blank'
              aria-label='pinterest-button'
            >
              <i className='ri-pinterest-fill rounded-full bg-black text-white p-2 text-base'></i>
            </Link>
            <Link
              href='https://www.facebook.com/profile.php?id=61575701980267'
              target='_blank'
              aria-label='facebook-button'
            >
              <i className='ri-facebook-circle-fill rounded-full bg-black text-white p-2 text-base'></i>
            </Link>
            <Link
              href='https://x.com/embroidize'
              target='_blank'
              aria-label='x-button'
            >
              <i className='ri-twitter-x-fill rounded-full bg-black text-white p-2 text-base'></i>
            </Link>
            <Link
              href='https://www.instagram.com/embroidize/'
              target='_blank'
              aria-label='instagram-button'
            >
              <i className='ri-instagram-fill rounded-full bg-black text-white p-2 text-base'></i>
            </Link>
            <Link
              href='https://www.youtube.com/channel/UCVCNRSIGLqdBG6O9D1xHGpQ'
              target='_blank'
              aria-label='youtube-button'
            >
              <i className='ri-youtube-fill rounded-full bg-black text-white p-2 text-base'></i>
            </Link>
          </div>
        </div>

        {/* Useful Links Section */}
        <div className='w-full lg:w-6/12'>
          <div className='flex flex-wrap items-top mb-6 font-semibold'>
            <div className='w-full lg:w-4/12 ml-auto'>
              <ul className='space-y-3'>
                <li>
                  <Link
                    href='/products'
                    prefetch={false}
                    className='text-gray-600 hover:underline transition-colors duration-200'
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    href='/Bundles'
                    prefetch={false}
                    className='text-gray-600 hover:underline transition-colors duration-200'
                  >
                    Bundles
                  </Link>
                </li>
                <li>
                  <Link
                    href='/blog'
                    prefetch={false}
                    className='text-gray-600 hover:underline transition-colors duration-200'
                  >
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link
                    href='/resources'
                    prefetch={false}
                    className='text-gray-600 hover:underline transition-colors duration-200'
                  >
                    Resources
                  </Link>
                </li>
                <li>
                  <Link
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-gray-600 hover:underline transition-colors duration-200 inline-flex items-center gap-1'
                    href='https://www.etsy.com/shop/embroidize'
                  >
                    Etsy Shop
                    <svg
                      className='w-3 h-3'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                      />
                    </svg>
                  </Link>
                </li>
              </ul>
            </div>

            <div className='w-full lg:w-4/12'>
              <ul className='space-y-3'>
                <li>
                  <Link
                    className='text-gray-600 hover:underline transition-colors duration-200'
                    href='/terms-and-conditions'
                    prefetch={false}
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    className='text-gray-600 hover:underline transition-colors duration-200'
                    href='/privacy-policy'
                    prefetch={false}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    className='text-gray-600 hover:underline transition-colors duration-200'
                    href='/about-us'
                    prefetch={false}
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    className='text-gray-600 hover:underline transition-colors duration-200'
                    href='/contact-us'
                    prefetch={false}
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    className='text-gray-600 hover:underline transition-colors duration-200'
                    href='/custom-embroidery-order'
                    prefetch={false}
                  >
                    Custom Digitizing
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Divider and Footer Info */}
      <div className='flex flex-wrap items-center md:justify-between justify-between py-2 px-1 border-t border-gray-300'>
        <div className='w-full md:w-4/12 px-4 mx-auto text-center'>
          <strong>Embroidize</strong>
          <p>&copy;{new Date().getFullYear()}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
