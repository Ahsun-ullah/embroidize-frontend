import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

export const productSlice = createApi({
  reducerPath: 'productSlice',
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
    allProducts: builder.query({
      query: ({ search = '', page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();

        if (search) params.append('search', search);
        params.append('page', String(page));
        params.append('limit', String(limit));

        return {
          url: `/public/product?${params.toString()}`,
          method: 'GET',
        };
      },
    }),
  }),
});

export const { useAllProductsQuery } = productSlice;
