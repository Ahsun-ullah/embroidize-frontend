import {
  useLogInMutation,
  useUserRegisterMutation,
  useVerifyOtpMutation,
} from '@/lib/redux/public/auth/authSlice';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import EmailOtpComponent from './EmailOtpComponent';
import { handleApiError } from '@/lib/utils/handleError';
import { SuccessToast } from './SuccessToast';

const EmailOtp = ({ step, setStep, userDetailsData }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isNavigating, setIsNavigating] = useState(false);

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [logIn, { isLoading: loginIsLoading }] = useLogInMutation();
  const [userRegister, { isLoading: isRegistering }] =
    useUserRegisterMutation();

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

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

    const nextIndex = Math.min(index + pastedText.length, otp.length - 1);
    const inputElements = document.querySelectorAll('input.code-input');
    inputElements[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullOtp = otp.join('');
    const email = userDetailsData?.email;

    try {
      await verifyOtp({
        email,
        otp: parseInt(fullOtp, 10),
      }).unwrap();

      const registerResult = await userRegister(userDetailsData).unwrap();

      SuccessToast(
        'Success',
        registerResult?.message || 'Registration successful!',
        3000,
      );

      const loginPayload = {
        email: userDetailsData.email,
        password: userDetailsData.password,
      };

      const loginResult = await logIn(loginPayload).unwrap();

      Cookies.set('token', loginResult.data.token);

      setIsNavigating(true);
      const role = loginResult?.data?.role;
      const destination = role === 'admin' ? '/admin' : '/';
      router.push(destination);
    } catch (error) {
      handleApiError(error, 'Something went wrong. Please try again.');
    }
  };

  return (
    <EmailOtpComponent
      userEmail={userDetailsData?.email}
      otp={otp}
      handlePaste={handlePaste}
      isLoading={isVerifying || isRegistering || loginIsLoading || isNavigating}
      handleSubmit={handleSubmit}
      setOtp={setOtp}
      setStep={setStep}
      step={step}
    />
  );
};

export default EmailOtp;
