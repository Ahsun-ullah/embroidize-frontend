'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import ForgotPasswordModal from '@/components/Common/ForgotPasswordForm';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { SuccessToast } from '@/components/Common/SuccessToast';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { setAuthToken } from '@/lib/auth';
import {
  useCheckResetTokenQuery,
  useResetPasswordMutation,
} from '@/lib/redux/common/user/userInfoSlice';
import { getApiErrorMessage } from '@/lib/utils/authErrors';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

// What a dead link should say, in words a customer can act on.
//
// The old page said none of this. It rendered the form whatever the state of the
// link, and a refused save flashed past as a three-second toast — so anyone whose
// link had expired chose a password, was told nothing that stayed on screen, and
// went off to sign in with a password that had never been saved. The single most
// important sentence here is the one saying the password has NOT changed.
const DEAD_LINK = {
  expired: {
    title: 'This reset link has expired',
    body: 'Your password has not been changed. Reset links stay valid for one hour, for your security. There is nothing wrong with your account — ask for a fresh link below and open it as soon as it arrives.',
  },
  used: {
    title: 'This reset link has already been used',
    body: 'If you have already chosen a new password, sign in with that one. If you did not get that far, your password is unchanged — ask for a fresh link below.',
  },
  missing: {
    title: 'This link is incomplete',
    body: 'The security code is missing from the address, which usually means the link was copied by hand or split across two lines by an email app. Your password has not been changed — open the button in the email again, or ask for a fresh link below.',
  },
};

export default function ResetPasswordForm() {
  const router = useRouter();

  // null = the URL has not been read yet, '' = there was no token in it.
  const [token, setToken] = useState(null);
  const [deadLink, setDeadLink] = useState(null);
  const [formError, setFormError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  // Read the token with URLSearchParams rather than by slicing the query string
  // by hand: the old version took everything after "?token=", so a second
  // parameter appended by an email or analytics redirect was swallowed into the
  // token itself and the link died for no visible reason.
  //
  // Deliberately not useSearchParams — reading it here keeps this page out of
  // the static-bailout trap that served other pages as empty HTML.
  useEffect(() => {
    const raw = (
      new URLSearchParams(window.location.search).get('token') || ''
    ).trim();
    setToken(raw);
    if (!raw) setDeadLink('missing');
  }, []);

  const {
    data: status,
    isFetching: isChecking,
    isError: checkFailed,
  } = useCheckResetTokenQuery(token, { skip: !token });

  useEffect(() => {
    const result = status?.data;
    if (!result) return;
    setDeadLink(result.valid ? null : result.reason || 'expired');
  }, [status]);

  const onSubmit = async (data) => {
    setFormError('');

    if (!token) {
      setDeadLink('missing');
      return;
    }

    try {
      const body = await resetPassword({
        token,
        password: data.password,
        confirm_password: data.confirm_password,
      }).unwrap();

      const payload = body?.data || {};

      // Signed in on the spot. Opening the link proved they hold the inbox and
      // they have just chosen the password, so sending them to a login form to
      // type it again is a step that only ever loses people.
      if (payload.token) {
        setAuthToken(payload.token);
        SuccessToast(
          'Password changed',
          'You are signed in with your new password.',
          5000,
        );
        router.push(payload.role === 'admin' ? '/admin' : '/');
        return;
      }

      SuccessToast(
        'Password changed',
        'Please sign in with your new password.',
        5000,
      );
      router.push('/auth/login');
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'We could not change your password. Please try again.',
      );

      // A dead link is not a form error — the form can never succeed — so the
      // page changes to explain it, and the explanation stays on screen.
      if (error?.data?.error?.name === 'Invalid or expired link') {
        setDeadLink('expired');
        return;
      }

      setFormError(message);
      ErrorToast('Password not changed', message, 6000);
    }
  };

  // The check is advisory. If it cannot be reached, show the form and let the
  // save itself be the judge — never withhold a working link because one
  // request failed.
  const checking = token === null || (isChecking && !checkFailed);
  const dead = deadLink ? DEAD_LINK[deadLink] || DEAD_LINK.expired : null;
  const maskedEmail = status?.data?.valid ? status.data.email : '';

  return (
    <>
      <Header />
      <div className='min-h-[60vh] bg-[#f4f4f4] px-4 py-12'>
        <div className='mx-auto w-full max-w-md rounded-xl bg-white p-6 shadow-sm sm:p-8'>
          {checking ? (
            <div className='flex flex-col items-center gap-3 py-8 text-center'>
              <LoadingSpinner />
              <p className='text-sm text-neutral-600'>Checking your link…</p>
            </div>
          ) : dead ? (
            <div>
              <h1 className='mb-3 text-center text-2xl font-bold text-neutral-900'>
                {dead.title}
              </h1>
              <p className='mb-6 text-center text-sm leading-relaxed text-neutral-700'>
                {dead.body}
              </p>

              <button
                type='button'
                onClick={() => setForgotOpen(true)}
                className='h-11 w-full rounded-md bg-black font-semibold text-white transition hover:bg-neutral-800'
              >
                Email me a new link
              </button>

              <p className='mt-4 text-center text-sm text-neutral-600'>
                Already know your password?{' '}
                <Link
                  href='/auth/login'
                  prefetch={false}
                  className='font-semibold text-black underline'
                >
                  Sign in
                </Link>
              </p>
            </div>
          ) : (
            <>
              <h1 className='mb-2 text-center text-2xl font-bold text-neutral-900'>
                Choose a new password
              </h1>

              {maskedEmail ? (
                <p className='mb-6 text-center text-sm text-neutral-600'>
                  For the account{' '}
                  <span className='font-semibold text-neutral-900'>
                    {maskedEmail}
                  </span>
                  . Sign in with that same address afterwards.
                </p>
              ) : (
                <p className='mb-6 text-center text-sm text-neutral-600'>
                  Use it to sign in with the email address this link was sent to.
                </p>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <PasswordField
                  id='password'
                  label='New password'
                  placeholder='At least 6 characters'
                  error={errors.password?.message}
                  registration={register('password')}
                />

                <PasswordField
                  id='confirm_password'
                  label='Confirm new password'
                  placeholder='Type it once more'
                  error={errors.confirm_password?.message}
                  registration={register('confirm_password')}
                />

                {formError ? (
                  <p
                    role='alert'
                    className='mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700'
                  >
                    {formError}
                  </p>
                ) : null}

                {/* Enabled as soon as the page is usable. It used to be disabled
                    until react-hook-form saw the form as "dirty", which a browser
                    or password manager filling both boxes does not reliably
                    trigger — so the button sat greyed out and dead for exactly
                    the customers least likely to work out why. */}
                <button
                  type='submit'
                  disabled={isLoading}
                  className={`h-11 w-full rounded-md font-semibold transition ${
                    isLoading
                      ? 'cursor-not-allowed bg-neutral-300 text-neutral-600'
                      : 'bg-black text-white hover:bg-neutral-800'
                  }`}
                >
                  {isLoading ? <LoadingSpinner /> : 'Save new password'}
                </button>
              </form>

              <p className='mt-4 text-center text-sm text-neutral-600'>
                Link stopped working?{' '}
                <button
                  type='button'
                  onClick={() => setForgotOpen(true)}
                  className='font-semibold text-black underline'
                >
                  Email me a new one
                </button>
              </p>
            </>
          )}
        </div>
      </div>
      <Footer />

      <ForgotPasswordModal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
      />
    </>
  );
}

function PasswordField({ id, label, placeholder, error, registration }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className='relative mb-4'>
      <label htmlFor={id} className='mb-1 block font-medium text-neutral-900'>
        {label}
      </label>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        autoComplete='new-password'
        placeholder={placeholder}
        aria-invalid={error ? 'true' : 'false'}
        className='w-full rounded-md border border-neutral-300 px-3 py-2 pr-10 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20'
        {...registration}
      />
      <button
        type='button'
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        className='absolute right-3 top-9 text-neutral-500 hover:text-neutral-900'
      >
        {visible ? (
          <i className='ri-eye-off-fill text-xl' />
        ) : (
          <i className='ri-eye-close-fill text-xl' />
        )}
      </button>
      {error ? (
        <p role='alert' className='mt-1 text-sm text-red-600'>
          {error}
        </p>
      ) : null}
    </div>
  );
}
