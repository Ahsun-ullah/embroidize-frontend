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
    logIn: builder.mutation({
      query: (body) => {
        return {
          url: `/public/login`,
          method: 'POST',
          body,
        };
      },
    }),
    forgetPassword: builder.mutation({
      query: (body) => {
        return {
          url: `/forgot-password`,
          method: 'POST',
          body,
        };
      },
    }),
    resetPassword: builder.mutation({
      query: (body) => {
        return {
          url: `/reset-password`,
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
} = authSlice;
