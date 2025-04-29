'use client';
import { useGenerateOtpMutation } from '@/lib/redux/public/auth/authSlice';
import { Card } from '@heroui/react';
import { useCallback, useEffect } from 'react';
import { ErrorToast } from './ErrorToast';
import LoadingSpinner from './LoadingSpinner';
import OtpComponent from './OtpComponent';
import { SuccessToast } from './SuccessToast';

const EmailOtpComponent = ({
  userEmail,
  otp,
  handlePaste,
  isLoading,
  handleSubmit,
  setOtp,
  step,
  setStep,
}) => {
  const [generateOtp, { isLoading: otpGenerateIsLoading }] =
    useGenerateOtpMutation();

  const handleKeyDown = useCallback(
    (e, index) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        const inputElements = document.querySelectorAll('input.code-input');
        const prevIndex = Math.max(0, index - 1);
        inputElements[prevIndex].focus();

        setOtp((prev) => {
          const updated = [...prev];
          updated[prevIndex] = '';
          return updated;
        });
      }
    },
    [setOtp],
  );

  const handleInput = useCallback(
    (e, index) => {
      const value = e.target.value.replace(/\D/g, ''); // Only digits
      const inputElements = document.querySelectorAll('input.code-input');

      setOtp((prev) => {
        const updated = [...prev];
        updated[index] = value[0] || '';
        return updated;
      });

      if (value && index < otp.length - 1) {
        inputElements[index + 1].focus();
      }
    },
    [otp.length, setOtp],
  );

  useEffect(() => {
    const inputElements = document.querySelectorAll('input.code-input');

    inputElements.forEach((el, idx) => {
      const keyDownHandler = (e) => handleKeyDown(e, idx);
      const inputHandler = (e) => handleInput(e, idx);

      el.addEventListener('keydown', keyDownHandler);
      el.addEventListener('input', inputHandler);

      // Cleanup
      return () => {
        el.removeEventListener('keydown', keyDownHandler);
        el.removeEventListener('input', inputHandler);
      };
    });
  }, [handleKeyDown, handleInput]);

  const handleResentOtp = async () => {
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
            <i className='ri-mail-line text-teal-600 fw-semibold'></i>
          </div>
        </div>

        <h4 className='text-xl sm:text-2xl font-semibold text-secondary-alt mt-4'>
          Verify Your Email
        </h4>

        <p className='text-muted text-sm sm:text-base mt-2'>
          Please enter the 6-digit code sent to{' '}
          <span className='font-semibold'>{userEmail}</span>
        </p>
      </div>

      <OtpComponent
        otp={otp}
        handlePaste={handlePaste}
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        setOtp={setOtp}
      />

      <div className='text-center text-base'>
        Didn’t receive a code?{' '}
        {otpGenerateIsLoading ? (
          <LoadingSpinner />
        ) : (
          <button
            disabled={otpGenerateIsLoading}
            onClick={handleResentOtp}
            className='text-teal-600 hover:underline font-semibold'
          >
            Resend
          </button>
        )}
      </div>
    </Card>
  );
};

export default EmailOtpComponent;
