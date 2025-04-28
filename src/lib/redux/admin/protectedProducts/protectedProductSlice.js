import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

export const protectedProductSlice = createApi({
  reducerPath: 'protectedProductSlice',
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
    addProduct: builder.mutation({
      query: (body) => ({
        url: '/product',
        method: 'POST',
        body,
      }),
    }),
    updateProduct: builder.mutation({
      query: (body) => ({
        url: `/product/${body.get('id')}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/product/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = protectedProductSlice;
