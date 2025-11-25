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
        <div className='flex gap-4 mb-8 justify-center'>
          <button
            onClick={() => {
              window.history.back();
              setTimeout(() => window.location.reload(), 100);
            }}
            className='px-6 py-3 bg-gradient-to-r from-gray-300 to-gray-400 text-black font-semibold rounded-lg hover:from-gray-400 hover:to-gray-500 transition shadow-md hover:shadow-lg'
            aria-label='Go to previous page'
          >
            ← Back
          </button>
          <Link
            href='/'
            className='px-6 py-3 bg-gradient-to-r from-black to-gray-800 text-white font-semibold rounded-lg hover:from-gray-800 hover:to-black transition shadow-md hover:shadow-lg'
            aria-label='Go to home page'
          >
            🏠 Home
          </Link>
        </div>

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
            className='text-black font-semibold underline mb-8 inline-block hover:text-gray-700 transition'
            aria-label='Contact support via email'
          >
            support@embroidize.com
          </Link>
        </div>
        <div className='flex gap-4 justify-center'>
          <button
            onClick={handleRetry}
            className='px-6 py-3 bg-gradient-to-r from-black to-gray-800 text-white font-semibold rounded-lg hover:from-gray-800 hover:to-black transition shadow-md hover:shadow-lg'
            aria-label='Retry loading the page'
          >
            🔄 Retry Now
          </button>
        </div>
      </div>
    </main>
  );
};

export default GlobalErrorPage;
