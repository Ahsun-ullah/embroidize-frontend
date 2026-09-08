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
    // Paged and filtered server-side. The endpoint used to return the whole
    // history in one response; customers with a thousand-plus downloads were
    // shipping all of it to look at one screen.
    UserDownloadHistory: builder.query({
      query: ({
        id,
        page = 1,
        limit = 20,
        search = '',
        fileType = 'all',
        stale = false,
      }) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (search) params.set('search', search);
        if (fileType && fileType !== 'all') params.set('fileType', fileType);
        if (stale) params.set('stale', '1');
        return {
          url: `/downloads/user/${id}?${params.toString()}`,
          method: 'GET',
        };
      },
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
