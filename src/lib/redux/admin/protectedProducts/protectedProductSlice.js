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
    // One past the highest numeric SKU — prefilled on the new-product form.
    getNextSku: builder.query({
      query: () => ({ url: '/product/next-sku', method: 'GET' }),
      keepUnusedDataFor: 0,
    }),
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
  useGetNextSkuQuery,
} = protectedProductSlice;
