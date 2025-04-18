import Link from 'next/link';

const Footer = () => {
  return (
    <footer className='py-6 container '>
      <div className='flex flex-wrap text-left lg:text-left py-2 px-1'>
        <div className='w-full lg:w-6/12'>
          <Link href={'/'} className='flex items-center justify-start my-4'>
            <i className='ri-centos-fill text-3xl'></i>
            <h4 className='text-3xl font-bold text-black'>EmbroID</h4>
          </Link>
          <h5 className='text-lg mt-0 mb-2 text-blueGray-600'>
            EMB provides high-quality design resources for professionals and
            businesses. Hurry! Explore and join our network of over 100K+
            professionals
          </h5>
          <div className='flex items-center justify-start gap-x-2'>
            <Link
              href={''}
              className='bg-black text-white shadow-lg font-normal p-3 rounded-full outline-none focus:outline-none '
              type='button'
              aria-label='twitter-button'
            >
              <i className='ri-twitter-x-fill'></i>
            </Link>
            <Link
              href={''}
              className='bg-black text-white shadow-lg font-normal p-3 rounded-full outline-none focus:outline-none '
              type='button'
              aria-label='facebook-button'
            >
              <i className='ri-facebook-circle-fill'></i>
            </Link>
            <Link
              href={''}
              className='bg-black text-white shadow-lg font-normal p-3 rounded-full outline-none focus:outline-none '
              type='button'
              aria-label='instagram-button'
            >
              <i className='ri-instagram-fill'></i>
            </Link>
          </div>
        </div>
        <div className='w-full lg:w-6/12 px-4'>
          <div className='flex flex-wrap items-top mb-6'>
            <div className='w-full lg:w-4/12 px-4 ml-auto'>
              <span className='block uppercase text-blueGray-500 text-lg font-bold mb-2'>
                Useful Links :
              </span>
              <ul className='list-unstyled'>
                <li>
                  <Link
                    className='text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm'
                    href='about-us'
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    className='text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm'
                    href='/blogs'
                  >
                    Blogs
                  </Link>
                </li>
              </ul>
            </div>
            <div className='w-full lg:w-4/12 px-4'>
              <span className='block uppercase text-blueGray-500 text-lg font-bold mb-2'>
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
                <li>
                  <Link
                    className='text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm'
                    href='/contact-us'
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <hr className=' border-blue-500 my-2' />
      <div className='flex flex-wrap items-center md:justify-between justify-between  py-2 px-1'>
        <div className=' w-full md:w-4/12 px-4 mx-auto text-center'>
          <strong>EmbroID</strong>
          <p>&copy;2024. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
