import {
  useLogInMutation,
  useUserRegisterMutation,
  useVerifyOtpMutation,
} from '@/lib/redux/public/auth/authSlice';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EmailOtpComponent from './EmailOtpComponent';
import { ErrorToast } from './ErrorToast';
import { SuccessToast } from './SuccessToast';

const EmailOtp = ({ step, setStep, userDetailsData }) => {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [logIn, { isLoading: loginIsLoading }] = useLogInMutation();
  const [userRegister, { isLoading: isRegistering }] =
    useUserRegisterMutation();

  const handlePaste = (e, index) => {
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

    // Focus the next available input field
    const nextIndex = Math.min(index + pastedText.length, otp.length - 1);
    const inputElements = document.querySelectorAll('input.code-input');
    inputElements[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullOtp = otp.join('');
    const email = userDetailsData?.email;

    try {
      // Step 1: Verify OTP
      const verifyResult = await verifyOtp({
        email,
        otp: parseInt(fullOtp, 10),
      }).unwrap();

      // SuccessToast(
      //   'Success',
      //   verifyResult?.data?.message || 'OTP verified successfully!',
      //   3000,
      // );

      // Step 2: Register user
      const registerResult = await userRegister(userDetailsData).unwrap();

      SuccessToast(
        'Success',
        registerResult?.data?.message || 'Registration successful!',
        3000,
      );

      // Step 3: Auto login
      const loginPayload = {
        email: userDetailsData.email,
        password: userDetailsData.password,
      };

      const loginResult = await logIn(loginPayload).unwrap();

      // SuccessToast(
      //   'Success',
      //   loginResult?.data?.message || 'Login successful!',
      //   3000,
      // );

      Cookies.set('token', loginResult.data.token);

      // Step 4: Redirect based on role
      const role = loginResult?.data?.role;
      const destination = role === 'admin' ? '/admin' : '/';
      router.push(destination);
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.message ||
        'Something went wrong. Please try again.';
      ErrorToast('Error', message, 3000);
    }
  };

  return (
    <EmailOtpComponent
      userEmail={userDetailsData?.email}
      otp={otp}
      handlePaste={handlePaste}
      isLoading={isVerifying || isRegistering || loginIsLoading}
      handleSubmit={handleSubmit}
      setOtp={setOtp}
      setStep={setStep}
      step={step}
    />
  );
};

export default EmailOtp;
