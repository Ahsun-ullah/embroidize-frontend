'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import {
  useAppleAuthMutation,
  useGoogleAuthMutation,
} from '@/lib/redux/public/auth/authSlice';
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function SocialLoginButtons({ showThankYou = true }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathName = searchParams.get('pathName') || '/';

  const googleButtonRef = useRef(null);
  const appleButtonRef = useRef(null);

  const [googleAuth] = useGoogleAuthMutation();
  const [appleAuth] = useAppleAuthMutation();

  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const loadScript = (src, id) =>
    new Promise((resolve, reject) => {
      if (document.getElementById(id)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.id = id;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(`Failed to load ${id}`);
      document.body.appendChild(script);
    });

  useEffect(() => {
    let mounted = true;

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
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            setIsSocialLoading(true);
            try {
              const result = await googleAuth({
                idToken: response.credential,
              }).unwrap();

              Cookies.set('token', result.data.token);

              if (showThankYou) {
                // Register / first-time flow -> go via thank-you
                router.push(
                  `/auth/thank-you?redirect=${encodeURIComponent(
                    pathName,
                  )}&email=${encodeURIComponent(
                    result.data.email,
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
            } catch {
              ErrorToast('Error', 'Google login failed', 3000);
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
        ErrorToast('Error', 'Failed to load Google login', 3000);
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

        window.addEventListener('AppleIDSignInOnSuccess', async (event) => {
          setIsSocialLoading(true);
          try {
            const result = await appleAuth({
              idToken: event.detail.authorization.id_token,
            }).unwrap();

            Cookies.set('token', result.data.token);

            if (showThankYou) {
              router.push(
                `/auth/thank-you?redirect=${encodeURIComponent(
                  pathName,
                )}&email=${encodeURIComponent(
                  result.data.email,
                )}&new_user=${result.data.isNew}`,
              );
            } else {
              if (result.data.role === 'admin') {
                router.push('/admin');
              } else {
                router.push(pathName || '/');
              }
            }
          } catch {
            ErrorToast('Error', 'Apple login failed', 3000);
            setIsSocialLoading(false);
          }
        });

        window.addEventListener('AppleIDSignInOnFailure', (event) => {
          console.error('Apple Sign In failed', event);
          ErrorToast('Error', 'Apple login failed', 3000);
        });
      } catch (err) {
        console.error(err);
        ErrorToast('Error', 'Failed to load Apple login', 3000);
      }
    };

    initGoogle();
    initApple();

    return () => {
      mounted = false;
    };
  }, [googleAuth, appleAuth, pathName, router, showThankYou]);

  return (
    <div className='flex flex-col items-center gap-3'>
      {isSocialLoading && (
        <div className='mb-2'>
          {/* You can replace with your own spinner component */}
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
