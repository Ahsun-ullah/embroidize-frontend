import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

export const adminChoiceSlice = createApi({
  reducerPath: 'adminChoiceSlice',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      const token = Cookies.get('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Single-product flip. Mutation response includes { isAdminChoice }
    // so the caller can reconcile its optimistic local state.
    toggleAdminChoice: builder.mutation({
      query: (productId) => ({
        url: `/admin/embroidize-choice/${productId}/toggle`,
        method: 'POST',
      }),
    }),
  }),
});

export const { useToggleAdminChoiceMutation } = adminChoiceSlice;
