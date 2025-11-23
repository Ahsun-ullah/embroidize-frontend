'use client';
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const OtpComponent = React.memo(function OtpComponent({
  otp,
  isLoading,
  handleSubmit,
  onPaste,
  onKeyDown,
  onInput,
  inputRefs,
}) {
  return (
    <div className='flex flex-col items-center justify-center w-full p-4'>
      <div className='flex justify-center gap-3 mb-4'>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            autoComplete='off'
            type='text'
            value={digit}
            id={`digit${index + 1}-input`}
            aria-label={`OTP digit ${index + 1}`}
            maxLength={1}
            className='code-input w-12 h-12 rounded text-center text-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black'
            onPaste={(e) => onPaste(e, index)}
            onKeyDown={(e) => onKeyDown(e, index)}
            onInput={(e) => onInput(e, index)}
          />
        ))}
      </div>

      <div className='w-full max-w-xs my-4'>
        {isLoading ? (
          <div className='flex justify-center' role='status' aria-live='polite'>
            <LoadingSpinner />
            <span className='sr-only'>Loading...</span>
          </div>
        ) : (
          <button
            type='button'
            onClick={handleSubmit}
            disabled={isLoading}
            className='w-full button font-semibold rounded-md text-center'
          >
            Confirm OTP
          </button>
        )}
      </div>
    </div>
  );
});

export default OtpComponent;