import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

export const productCommonSlice = createApi({
  reducerPath: 'productCommonSlice',
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
    downloadProduct: builder.query({
      query: (body) => {
        const id = body.id;
        const extension = body.extension;
        return {
          url: `/download/product/${id}/extension/${extension}`,
          method: 'GET',
          responseHandler: (response) => response.blob(),
        };
      },
      // Return a serializable value for Redux but keep the blob in meta
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      transformResponse: (blob, meta) => {
        return { success: true };
      },
      // Don't use the result for cache key generation
      serializeQueryArgs: ({ queryArgs }) => {
        return JSON.stringify(queryArgs);
      },
      // Force refetch
      forceRefetch: () => true,
    }),
  }),
});

export const { useLazyDownloadProductQuery } = productCommonSlice;
