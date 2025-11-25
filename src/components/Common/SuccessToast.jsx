import { addToast, cn } from '@heroui/react';

export const SuccessToast = (success, message, time) => {
  return addToast({
    title: `${success}!`,
    description: `${message}`,
    timeout: `${time}`,
    color: 'success',
    position: 'top-right',
    shouldShowTimeoutProgress: true,
    classNames: {
      closeButton: 'opacity-100 absolute right-4 top-1/2 -translate-y-1/2 ms-8',
      base: cn(['bg-default-50 dark:bg-background shadow-sm text-black flex']),
    },

    closeIcon: (
      <svg
        fill='none'
        height='32'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        viewBox='0 0 24 24'
        width='32'
      >
        <path d='M18 6 6 18' />
        <path d='m6 6 12 12' />
      </svg>
    ),
  });
};
