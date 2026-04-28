import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

export const favoritesSlice = createApi({
  reducerPath: 'favoritesSlice',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      const token = Cookies.get('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Favorites'],
  endpoints: (builder) => ({
    getFavoriteIds: builder.query({
      query: () => '/favorites/ids',
      providesTags: ['Favorites'],
    }),
    getUserFavorites: builder.query({
      query: () => '/favorites',
      providesTags: ['Favorites'],
    }),
    toggleFavorite: builder.mutation({
      query: (productId) => ({
        url: `/favorites/${productId}`,
        method: 'POST',
      }),
      // Optimistic update — heart flips instantly, reverts on API error
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          favoritesSlice.util.updateQueryData('getFavoriteIds', undefined, (draft) => {
            if (!draft?.data?.ids) return;
            const idx = draft.data.ids.indexOf(productId);
            if (idx >= 0) {
              draft.data.ids.splice(idx, 1);
            } else {
              draft.data.ids.push(productId);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ['Favorites'],
    }),
  }),
});

export const {
  useGetFavoriteIdsQuery,
  useGetUserFavoritesQuery,
  useToggleFavoriteMutation,
} = favoritesSlice;
