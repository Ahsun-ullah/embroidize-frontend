import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

export const authSlice = createApi({
  reducerPath: 'authSlice',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_API_URL}`,
    prepareHeaders: (headers) => {
      const token = Cookies.get('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    userRegister: builder.mutation({
      query: (body) => ({
        url: '/public/register',
        method: 'POST',
        body,
      }),
    }),
    // Does an account already exist for this address?
    //
    // Called before a verification code is sent, so a returning customer is
    // pointed at the sign-in page immediately instead of filling in the form,
    // waiting for a code, typing it, and only then being told the address is
    // taken. Answers 200 when the user exists and 404 when they do not, so
    // both outcomes are normal and neither is an error worth surfacing.
    verifyExistingUser: builder.mutation({
      query: (body) => ({
        url: '/public/verify-existing-user',
        method: 'POST',
        body,
      }),
    }),
    generateOtp: builder.mutation({
      query: (body) => ({
        url: '/public/otp',
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (body) => ({
        url: '/public/otp/verify',
        method: 'POST',
        body,
      }),
    }),
    logIn: builder.mutation({
      query: (body) => {
        return {
          url: `/public/login`,
          method: 'POST',
          body,
        };
      },
    }),

    googleAuth: builder.mutation({
      query: (body) => ({
        url: '/public/auth/google',
        method: 'POST',
        body,
      }),
    }),
    appleAuth: builder.mutation({
      query: (body) => ({
        url: '/public/auth/apple',
        method: 'POST',
        body,
      }),
    }),

    forgetPassword: builder.mutation({
      query: (body) => {
        return {
          url: `/public/forgot-password`,
          method: 'POST',
          body,
        };
      },
    }),
    resetPassword: builder.mutation({
      query: (body) => {
        return {
          url: `/public/reset-password`,
          method: 'POST',
          body,
        };
      },
    }),
  }),
});

export const {
  useLogInMutation,
  useUserRegisterMutation,
  useForgetPasswordMutation,
  useResetPasswordMutation,
  useGenerateOtpMutation,
  useVerifyOtpMutation,
  useVerifyExistingUserMutation,
  useGoogleAuthMutation,
  useAppleAuthMutation,
} = authSlice;
