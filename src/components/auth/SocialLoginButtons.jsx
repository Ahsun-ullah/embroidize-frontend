'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { useFingerprint } from '@/lib/hooks/useFingerprint';
import {
  useAppleAuthMutation,
  useGoogleAuthMutation,
} from '@/lib/redux/public/auth/authSlice';
import { setAuthToken } from '@/lib/auth';
import { getApiErrorMessage } from '@/lib/utils/authErrors';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function SocialLoginButtons({ showThankYou = true }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathName = searchParams.get('pathName') || '/';

  const googleButtonRef = useRef(null);
  const appleButtonRef = useRef(null);

  const fingerprint = useFingerprint();
  const [googleAuth] = useGoogleAuthMutation();
  const [appleAuth] = useAppleAuthMutation();

  const [isSocialLoading, setIsSocialLoading] = useState(false);

  // The fingerprint is computed asynchronously (FingerprintJS is imported
  // dynamically and takes a moment), so it is empty on the first render.
  //
  // Google's SDK is handed a callback ONCE at initialize() time, and that
  // callback closes over whatever the value was then — which, with the effect
  // running on mount, was always the empty string. Every account created
  // through Google therefore stored no fingerprint at all, quietly disabling
  // the per-device duplicate check for exactly the sign-up path where it was
  // most needed. Adding `fingerprint` to the effect's dependencies would fix
  // the value but re-run the whole SDK setup on every change; a ref reads the
  // current value at call time instead, with no re-initialisation.
  const fingerprintRef = useRef(fingerprint);
  useEffect(() => {
    fingerprintRef.current = fingerprint;
  }, [fingerprint]);

  // Both providers finish the same way; only the label differs.
  const completeSocialLogin = useCallback(
    (result) => {
      setAuthToken(result.data.token);

      if (typeof window !== 'undefined' && result?.data?.isNew) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'signup_success',
          method: result.method,
        });
      }

      if (showThankYou) {
        // Register / first-time flow -> go via thank-you
        router.push(
          `/auth/thank-you?redirect=${encodeURIComponent(
            pathName,
          )}&new_user=${result.data.isNew}`,
        );
      } else {
        // Login flow -> go directly
        if (result.data.role === 'admin') {
          router.push('/admin');
        } else {
          router.push(pathName || '/');
        }
      }
    },
    [pathName, router, showThankYou],
  );

  const loadScript = (src, id) =>
    new Promise((resolve, reject) => {
      const existing = document.getElementById(id);
      if (existing) {
        // The script tag can already be in the DOM while still downloading —
        // a second mount (navigating login -> register) hits exactly that. The
        // old code resolved immediately and then read window.google, which was
        // not there yet, so the button silently failed to render.
        if (existing.dataset.loaded === 'true') return resolve();
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(`Failed to load ${id}`), {
          once: true,
        });
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.id = id;
      script.async = true;
      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = () => reject(`Failed to load ${id}`);
      document.body.appendChild(script);
    });

  useEffect(() => {
    let mounted = true;
    // Apple dispatches its results as window events. The handlers must be the
    // same references at removal time, so they are declared here and torn down
    // in the cleanup below — previously they were added on every run of this
    // effect and never removed, so each remount stacked another listener and a
    // single sign-in fired appleAuth two, three, four times over.
    let onAppleSuccess;
    let onAppleFailure;

    const initGoogle = async () => {
      try {
        await loadScript(
          'https://accounts.google.com/gsi/client',
          'google-client-script',
        );

        if (!mounted || !window.google || !googleButtonRef.current) return;

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
          console.error('Google Client ID not defined');
          ErrorToast(
            'Error',
            'Google sign-in is unavailable right now. Please use your email and password.',
            5000,
          );
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            setIsSocialLoading(true);
            try {
              const result = await googleAuth({
                idToken: response.credential,
                // Read at call time, so the real value is sent.
                fingerprint: fingerprintRef.current,
              }).unwrap();

              completeSocialLogin({ ...result, method: 'google' });
            } catch (error) {
              // Show what the server actually said.
              //
              // This used to be a bare `catch {}` that reported "Google login
              // failed" for every cause alike — an account already existing on
              // the device, a rate limit, a disabled account, an unreachable
              // server. The customer was given nothing to act on, and support
              // had no way to tell the cases apart.
              ErrorToast(
                'Sign-in failed',
                getApiErrorMessage(
                  error,
                  'Google sign-in failed. Please try again, or sign in with your email and password.',
                ),
                6000,
              );
              setIsSocialLoading(false);
            }
          },
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 300,
        });
      } catch (err) {
        console.error(err);
        // A blocked or failed SDK download is not the customer's fault and not
        // something retrying the button can fix — point them at the path that
        // still works.
        ErrorToast(
          'Error',
          'Google sign-in could not load (an ad blocker or network filter may be blocking it). You can still sign in with your email and password.',
          6000,
        );
      }
    };

    const initApple = async () => {
      try {
        await loadScript(
          'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js',
          'apple-client-script',
        );

        if (!mounted || !window.AppleID || !appleButtonRef.current) return;

        const appleClientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
        const appleRedirectURI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI;

        if (!appleClientId || !appleRedirectURI) {
          console.error('Apple Client ID or Redirect URI not defined');
          return;
        }

        window.AppleID.auth.init({
          clientId: appleClientId,
          redirectURI: appleRedirectURI,
          scope: 'email name',
          usePopup: true,
        });

        appleButtonRef.current.innerHTML = `
          <appleid-signin
            id="appleid-signin"
            color="black"
            type="sign in"
            locale="en_US"
            height="40"
            width="300">
          </appleid-signin>
        `;

        onAppleSuccess = async (event) => {
          setIsSocialLoading(true);
          try {
            const result = await appleAuth({
              idToken: event.detail.authorization.id_token,
              fingerprint: fingerprintRef.current,
            }).unwrap();

            completeSocialLogin({ ...result, method: 'apple' });
          } catch (error) {
            ErrorToast(
              'Sign-in failed',
              getApiErrorMessage(
                error,
                'Apple sign-in failed. Please try again, or sign in with your email and password.',
              ),
              6000,
            );
            setIsSocialLoading(false);
          }
        };

        onAppleFailure = (event) => {
          // The SDK also fires this when the customer simply closes the popup,
          // which is not an error worth shouting about.
          const reason = event?.detail?.error;
          if (reason === 'popup_closed_by_user' || reason === 'user_cancelled_authorize') {
            setIsSocialLoading(false);
            return;
          }
          console.error('Apple Sign In failed', event);
          ErrorToast('Sign-in failed', 'Apple sign-in did not complete. Please try again.', 4000);
          setIsSocialLoading(false);
        };

        window.addEventListener('AppleIDSignInOnSuccess', onAppleSuccess);
        window.addEventListener('AppleIDSignInOnFailure', onAppleFailure);
      } catch (err) {
        console.error(err);
        ErrorToast(
          'Error',
          'Apple sign-in could not load. You can still sign in with your email and password.',
          5000,
        );
      }
    };

    initGoogle();
    initApple();

    return () => {
      mounted = false;
      if (onAppleSuccess) {
        window.removeEventListener('AppleIDSignInOnSuccess', onAppleSuccess);
      }
      if (onAppleFailure) {
        window.removeEventListener('AppleIDSignInOnFailure', onAppleFailure);
      }
    };
  }, [googleAuth, appleAuth, completeSocialLogin]);

  return (
    <div className='flex flex-col items-center gap-3'>
      {isSocialLoading && (
        <div className='mb-2'>
          <span className='text-sm text-gray-500'>
            Processing, please wait...
          </span>
        </div>
      )}

      <div
        ref={googleButtonRef}
        className={`flex justify-center ${isSocialLoading ? 'opacity-40 pointer-events-none' : ''}`}
      />
      <div
        ref={appleButtonRef}
        className={`flex justify-center ${isSocialLoading ? 'opacity-40 pointer-events-none' : ''}`}
      />
    </div>
  );
}
