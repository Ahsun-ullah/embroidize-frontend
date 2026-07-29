import { baseQueryWithReauth } from '@/lib/apis/baseQueryWithReauth';
import { createApi } from '@reduxjs/toolkit/query/react';

export const userInfoSlice = createApi({
  reducerPath: 'userInfoSlice',
  baseQuery: baseQueryWithReauth,
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
