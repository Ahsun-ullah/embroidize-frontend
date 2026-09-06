'use client';
import { useGenerateOtpMutation } from '@/lib/redux/public/auth/authSlice';
import { getApiErrorMessage, getRetryAfterSeconds } from '@/lib/utils/authErrors';
import { Card } from '@heroui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ErrorToast } from './ErrorToast';
import LoadingSpinner from './LoadingSpinner';
import OtpComponent from './OtpComponent';
import { SuccessToast } from './SuccessToast';

// Whole seconds remaining until `deadline` (a timestamp in ms), never negative.
const secondsLeft = (deadline) =>
  deadline ? Math.max(0, Math.ceil((deadline - Date.now()) / 1000)) : 0;

const formatClock = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const EmailOtpComponent = React.memo(function EmailOtpComponent({
  userEmail,
  otp,
  setOtp,
  step,
  setStep,
  isLoading,
  handleSubmit,
  // { expiresInSeconds, resendInSeconds } from the send that brought us here.
  otpMeta,
}) {
  const [generateOtp, { isLoading: otpGenerateIsLoading }] =
    useGenerateOtpMutation();
  const inputRefs = useRef([]);

  // ── Countdowns ────────────────────────────────────────────────────────────
  //
  // Both numbers come from the server, so the screen can never promise a window
  // the backend does not honour.
  //
  // Without them the customer had no idea how long their code was good for, nor
  // when Resend would work. So they pressed Resend repeatedly, spent the send
  // allowance in seconds, and were then refused for the rest of the window with
  // nothing to explain why. A button that counts down is both kinder and a
  // better brake, because it stops the clicking that causes the lockout.
  const [expiresAt, setExpiresAt] = useState(null);
  const [resendAt, setResendAt] = useState(null);
  const [, forceTick] = useState(0);

  // Seed from the initial send, then re-seed after every resend.
  useEffect(() => {
    if (!otpMeta) return;
    const now = Date.now();
    if (otpMeta.expiresInSeconds) {
      setExpiresAt(now + otpMeta.expiresInSeconds * 1000);
    }
    if (otpMeta.resendInSeconds) {
      setResendAt(now + otpMeta.resendInSeconds * 1000);
    }
  }, [otpMeta]);

  // One timer drives both countdowns, and stops once neither is running.
  useEffect(() => {
    if (!expiresAt && !resendAt) return undefined;
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [expiresAt, resendAt]);

  const expiresIn = secondsLeft(expiresAt);
  const resendIn = secondsLeft(resendAt);
  const hasExpired = Boolean(expiresAt) && expiresIn === 0;

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
    if (resendIn > 0 || otpGenerateIsLoading) return;

    try {
      const response = await generateOtp({ email: userEmail }).unwrap();

      // A resend starts a brand-new code, so both clocks restart. The previous
      // code stays valid until its own expiry — whichever email arrives first
      // is the one that works.
      const now = Date.now();
      const meta = response?.data || {};
      if (meta.expiresInSeconds) {
        setExpiresAt(now + meta.expiresInSeconds * 1000);
      }
      setResendAt(now + (meta.resendInSeconds || 45) * 1000);

      // Clear the boxes so a stale half-typed code isn't mistaken for the new one.
      setOtp(['', '', '', '', '', '']);

      SuccessToast(
        'Code sent',
        response?.message || 'We sent a new code to your email.',
        4000,
      );
    } catch (error) {
      // If the server refused because we asked too soon, adopt its clock — the
      // button then counts down accurately instead of inviting another failure.
      const retryAfter = getRetryAfterSeconds(error);
      if (retryAfter) setResendAt(Date.now() + retryAfter * 1000);

      ErrorToast(
        'Error',
        getApiErrorMessage(error, 'Could not send a new code. Please try again.'),
        5000,
      );
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

        <p className='text-slate-400 text-xs mt-1'>
          It can take a minute to arrive — check your spam folder too.
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

      {/* How long the code remains good for. */}
      {expiresAt && (
        <div className='text-center text-sm mb-2' aria-live='polite'>
          {hasExpired ? (
            <span className='text-gray-600'>
              This code has expired. Request a new one below.
            </span>
          ) : (
            <span className='text-gray-500'>
              Code expires in{' '}
              <span className='font-semibold tabular-nums'>
                {formatClock(expiresIn)}
              </span>
            </span>
          )}
        </div>
      )}

      <div className='text-center text-base'>
        Didn’t receive a code?{' '}
        {otpGenerateIsLoading ? (
          <LoadingSpinner />
        ) : (
          <button
            disabled={resendIn > 0}
            onClick={handleResendOtp}
            className={
              resendIn > 0
                ? 'text-gray-400 font-semibold cursor-not-allowed'
                : 'text-teal-600 hover:underline font-semibold'
            }
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend'}
          </button>
        )}
      </div>
    </Card>
  );
});

export default EmailOtpComponent;
