import {
  useLogInMutation,
  useUserRegisterMutation,
  useVerifyOtpMutation,
} from '@/lib/redux/public/auth/authSlice';
import { setAuthToken } from '@/lib/auth';
import {
  getApiErrorMessage,
  isAccountExistsError,
} from '@/lib/utils/authErrors';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import EmailOtpComponent from './EmailOtpComponent';
import { ErrorToast } from './ErrorToast';
import GlobalLoadingPage from './GlobalLoadingPage';
import { SuccessToast } from './SuccessToast';

const EmailOtp = ({ step, setStep, userDetailsData, pathName, otpMeta }) => {
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

  useEffect(() => {
    if (!userDetailsData) {
      ErrorToast('Error', 'Session expired. Please start registration again.', 4000);
      setStep(1);
    }
  }, [userDetailsData, setStep]);

  if (!userDetailsData) {
    return <GlobalLoadingPage />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullOtp = otp.join('');

    if (!/^\d{6}$/.test(fullOtp)) {
      return ErrorToast('Error', 'Please enter the 6-digit code.', 3000);
    }

    const email = userDetailsData?.email;

    // ── Three steps, three distinct outcomes ────────────────────────────────
    //
    // Verify, register, then sign in. These used to share one try/catch and one
    // message — "Something went wrong. Please try again." — which is actively
    // misleading at the third step: by then the ACCOUNT ALREADY EXISTS, and
    // "try again" sends the customer back to create a duplicate they will be
    // refused for. Each step now fails on its own terms.

    // 1. Prove the customer owns the inbox.
    try {
      await verifyOtp({ email, otp: fullOtp }).unwrap();
    } catch (error) {
      return ErrorToast(
        'Error',
        getApiErrorMessage(error, 'That code is not valid. Please check your email and try again.'),
        5000,
      );
    }

    // 2. Create the account.
    try {
      await userRegister(userDetailsData).unwrap();
    } catch (error) {
      // Already registered: guidance, not a failure. Send them to sign in
      // rather than leaving them stuck on a screen that cannot progress.
      if (isAccountExistsError(error)) {
        ErrorToast('Account exists', getApiErrorMessage(error), 6000);
        return router.push(
          `/auth/login${pathName ? `?pathName=${encodeURIComponent(pathName)}` : ''}`,
        );
      }

      return ErrorToast(
        'Registration failed',
        getApiErrorMessage(error, 'We could not create your account. Please try again.'),
        6000,
      );
    }

    // ✅ TRACK SIGNUP SUCCESS (GTM / dataLayer)
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'signup_success',
        method: 'email',
      });
    }

    // 3. Sign the new account in.
    //
    // If this fails the account is still created and perfectly usable, so the
    // customer is told exactly that and handed to the sign-in page — never
    // told registration failed.
    try {
      const loginResult = await logIn({
        email: userDetailsData.email,
        password: userDetailsData.password,
      }).unwrap();

      setAuthToken(loginResult.data.token);

      setIsNavigating(true);
      const role = loginResult?.data?.role;

      const finalDestination = role === 'admin' ? '/admin' : pathName || '/';

      router.push(
        `/auth/thank-you?redirect=${encodeURIComponent(finalDestination)}&new_user=true`,
      );
    } catch (error) {
      SuccessToast(
        'Account created',
        'Your account is ready. Please sign in to continue.',
        6000,
      );
      console.error('Post-registration sign-in failed:', getApiErrorMessage(error));
      router.push(
        `/auth/login${pathName ? `?pathName=${encodeURIComponent(pathName)}` : ''}`,
      );
    }
  };

  return (
    <EmailOtpComponent
      userEmail={userDetailsData?.email}
      otp={otp}
      isLoading={isVerifying || isRegistering || loginIsLoading || isNavigating}
      handleSubmit={handleSubmit}
      setOtp={setOtp}
      setStep={setStep}
      step={step}
      otpMeta={otpMeta}
    />
  );
};

export default EmailOtp;
