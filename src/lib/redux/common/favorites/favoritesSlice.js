import { baseQueryWithReauth } from '@/lib/apis/baseQueryWithReauth';
import { createApi } from '@reduxjs/toolkit/query/react';

export const favoritesSlice = createApi({
  reducerPath: 'favoritesSlice',
  baseQuery: baseQueryWithReauth,
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
      // Optimistic update — heart flips instantly, reverts on API error.
      // The mutation response includes { isFavourited, favoriteCount } so callers
      // (FavoriteButton) can reconcile their local count to the server count.
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
