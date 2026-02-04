import {
  useLogInMutation,
  useUserRegisterMutation,
  useVerifyOtpMutation,
} from '@/lib/redux/public/auth/authSlice';
import { handleApiError } from '@/lib/utils/handleError';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import EmailOtpComponent from './EmailOtpComponent';

const EmailOtp = ({ step, setStep, userDetailsData, pathName }) => {
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

    if (!/^\d{6}$/.test(fullOtp)) {
      return handleApiError(null, 'Please enter the 6-digit OTP.');
    }

    const email = userDetailsData?.email;

    if (!userDetailsData?.email) {
      return handleApiError(
        null,
        'Session expired. Please start registration again.',
      );
    }

    try {
      await verifyOtp({ email, otp: fullOtp }).unwrap();

      const registerResult = await userRegister(userDetailsData).unwrap();

      const loginPayload = {
        email: userDetailsData.email,
        password: userDetailsData.password,
      };

      const loginResult = await logIn(loginPayload).unwrap();

      Cookies.set('token', loginResult.data.token);

      setIsNavigating(true);
      const role = loginResult?.data?.role;

      // Determine final destination
      const finalDestination = role === 'admin' ? '/admin' : pathName || '/';

      // Redirect to thank you page with destination and user info
      router.push(
        `/auth/thank-you?redirect=${encodeURIComponent(finalDestination)}&email=${encodeURIComponent(userDetailsData.email)}&new_user=true`,
      );
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
