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
  }),
});

export const { useUserInfoQuery } = userInfoSlice;
