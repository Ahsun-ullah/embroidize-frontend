import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

export const likesSlice = createApi({
  reducerPath: 'likesSlice',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      const token = Cookies.get('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Likes'],
  endpoints: (builder) => ({
    getLikedIds: builder.query({
      query: () => '/likes/ids',
      providesTags: ['Likes'],
    }),
    toggleLike: builder.mutation({
      query: (productId) => ({
        url: `/likes/${productId}`,
        method: 'POST',
      }),
      // Optimistic update — icon flips instantly, reverts on API error.
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          likesSlice.util.updateQueryData('getLikedIds', undefined, (draft) => {
            if (!draft?.data?.ids) return;
            const idx = draft.data.ids.indexOf(productId);
            if (idx >= 0) {
              draft.data.ids.splice(idx, 1);
            } else {
              draft.data.ids.push(productId);
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const { useGetLikedIdsQuery, useToggleLikeMutation } = likesSlice;
