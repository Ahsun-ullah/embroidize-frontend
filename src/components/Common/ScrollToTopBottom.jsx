'use client';
import { ChevronsDown, ChevronsUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const ScrollToTopBottom = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className='fixed bottom-4 right-2 z-50'>
      {isVisible && (
        <div className='flex flex-col space-y-2 fixed bottom-28 right-2 z-50'>
          <button
            onClick={scrollToTop}
            className='p-3 sm:p-2 rounded bg-gray-800 text-white
               hover:bg-gray-900 focus:outline-none
               focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
          >
            <ChevronsUp className='w-6 h-6 sm:w-5 sm:h-5' />
          </button>

          <button
            onClick={scrollToBottom}
            className='p-3 sm:p-2 rounded bg-gray-800 text-white
               hover:bg-gray-900 focus:outline-none
               focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
          >
            <ChevronsDown className='w-6 h-6 sm:w-5 sm:h-5' />
          </button>
        </div>
      )}
    </div>
  );
};

export default ScrollToTopBottom;
