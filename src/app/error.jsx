'use client';

import Link from 'next/link';

const GlobalErrorPage = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <main
      role='alert'
      aria-live='assertive'
      className='min-h-screen flex flex-col justify-center items-center bg-white px-6 text-center'
    >
      <div className='max-w-md p-8 rounded-xl shadow-lg'>
        <div>
          <h1 className='text-3xl font-extrabold mb-6' tabIndex={-1}>
            Oops! Something Went Wrong!
          </h1>
          <p className='text-lg mb-4 font-semibold leading-relaxed'>
            Please try refreshing the page, or come back a little later. If the
            problem persists, feel free to contact our support team for help.
          </p>
          <Link
            href='mailto:support@embroidize.com'
            className='text-black font-semibold underline mb-8 inline-block'
            aria-label='Contact support via email'
          >
            support@embroidize.com
          </Link>
        </div>
        <button
          onClick={handleRetry}
          className='px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-200 hover:text-black transition'
          aria-label='Retry loading the page'
        >
          Retry Now
        </button>
      </div>
    </main>
  );
};

export default GlobalErrorPage;
