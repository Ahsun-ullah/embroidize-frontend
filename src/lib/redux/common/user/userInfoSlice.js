import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

export const userInfoSlice = createApi({
  reducerPath: 'userInfoSlice',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      const token = Cookies.get('token');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    userInfo: builder.query({
      query: () => ({
        url: '/userinfo',
        method: 'GET',
      }),
    }),
    updateUserInfo: builder.mutation({
      query: (body) => ({
        url: `/user/${body.get('id')}`,
        method: 'PUT',
        body,
      }),
    }),
    updatePassword: builder.mutation({
      query: (body) => ({
        url: `/settings/password/`,
        method: 'PATCH',
        body,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: '/public/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({
        url: '/public/reset-password',
        method: 'POST',
        body,
      }),
    }),
    UserDownloadHistory: builder.query({
      query: (id) => ({
        url: `/downloads/user/${id}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useUserInfoQuery,
  useUpdateUserInfoMutation,
  useUserDownloadHistoryQuery,
  useUpdatePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = userInfoSlice;
