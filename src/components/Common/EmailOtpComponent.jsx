'use client';
import { useGenerateOtpMutation } from '@/lib/redux/public/auth/authSlice';
import { Card } from '@heroui/react';
import React, { useCallback, useRef } from 'react';
import { ErrorToast } from './ErrorToast';
import LoadingSpinner from './LoadingSpinner';
import OtpComponent from './OtpComponent';
import { SuccessToast } from './SuccessToast';

const EmailOtpComponent = React.memo(function EmailOtpComponent({
  userEmail,
  otp,
  setOtp,
  step,
  setStep,
  isLoading,
  handleSubmit,
}) {
  const [generateOtp, { isLoading: otpGenerateIsLoading }] =
    useGenerateOtpMutation();
  const inputRefs = useRef([]);

  const handleKeyDown = useCallback(
    (e, index) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    },
    [otp],
  );

  const handleInput = useCallback(
    (e, index) => {
      const value = e.target.value.replace(/\D/g, '');
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    },
    [otp, setOtp],
  );

  const handlePaste = useCallback(
    (e, index) => {
      e.preventDefault();
      const pastedText = e.clipboardData
        .getData('Text')
        .replace(/\D/g, '')
        .slice(0, 6);
      const newOtp = [...otp];

      for (let i = 0; i < pastedText.length; i++) {
        if (index + i < otp.length) {
          newOtp[index + i] = pastedText[i];
        }
      }
      setOtp(newOtp);

      const nextIndex = Math.min(index + pastedText.length, otp.length - 1);
      inputRefs.current[nextIndex]?.focus();
    },
    [otp, setOtp],
  );

  const handleResendOtp = async () => {
    try {
      const response = await generateOtp({ email: userEmail }).unwrap();
      SuccessToast(
        'Success',
        response?.message || 'OTP sent successfully!',
        3000,
      );
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.message ||
        'Something went wrong. Please try again.';
      ErrorToast('Error', message, 3000);
    }
  };

  return (
    <Card className='max-w-md w-full mx-auto p-6 sm:p-8 md:p-10 rounded-2xl shadow-md bg-white'>
      <div>
        <button
          className='flex items-center justify-start text-sm font-semibold button'
          onClick={() => setStep(step - 1)}
        >
          Back
        </button>
      </div>

      <div className='mb-6 text-center'>
        <div className='flex justify-center'>
          <div className='w-16 h-16 flex items-center justify-center bg-primary-alt text-primary text-3xl rounded-full'>
            <i className='ri-mail-line text-black fw-semibold'></i>
          </div>
        </div>

        <h4 className='text-xl sm:text-2xl font-semibold text-secondary-alt mt-4'>
          Verify Your Email
        </h4>

        <p className='text-slate-400 text-sm sm:text-base mt-2'>
          Please enter the 6-digit code sent to{' '}
          <span className='font-semibold'>{userEmail}</span>
        </p>
      </div>

      <OtpComponent
        otp={otp}
        setOtp={setOtp}
        onPaste={handlePaste}
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        inputRefs={inputRefs}
      />

      <div className='text-center text-base'>
        Didn’t receive a code?{' '}
        {otpGenerateIsLoading ? (
          <LoadingSpinner />
        ) : (
          <button
            disabled={otpGenerateIsLoading}
            onClick={handleResendOtp}
            className='text-teal-600 hover:underline font-semibold'
          >
            Resend
          </button>
        )}
      </div>
    </Card>
  );
});

export default EmailOtpComponent;