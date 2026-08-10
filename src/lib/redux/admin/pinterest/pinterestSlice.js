import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

export const pinterestSlice = createApi({
  reducerPath: 'pinterestSlice',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      const token = Cookies.get('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['PinterestSettings', 'PinHistory'],
  endpoints: (builder) => ({
    // Boards are fetched live rather than cached in our DB — a board renamed or
    // deleted on Pinterest would otherwise show up here as a stale option that
    // fails at post time.
    getBoards: builder.query({
      query: () => '/admin/pinterest/boards',
      transformResponse: (res) => res?.data || [],
    }),

    // Everything the modal needs pre-filled: image, suggested caption, link,
    // default board, and whether this product was already pinned.
    getPinDraft: builder.query({
      query: (productId) => `/admin/pinterest/draft/${productId}`,
      transformResponse: (res) => res?.data || null,
    }),

    createPin: builder.mutation({
      query: (body) => ({
        url: '/admin/pinterest/pin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PinHistory'],
    }),

    bulkQueuePins: builder.mutation({
      query: (body) => ({
        url: '/admin/pinterest/pin/bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PinHistory'],
    }),

    getPinHistory: builder.query({
      query: (params = {}) => ({
        url: '/admin/pinterest/pins',
        params,
      }),
      transformResponse: (res) => res?.data || { pins: [], pendingCount: 0 },
      providesTags: ['PinHistory'],
    }),

    // Settings load/save go through plain fetch in PinterestConfigWrapper, the
    // same way the Stripe settings page does — the page is server-rendered with
    // its initial data and calls router.refresh() after a save.
    getPinterestAuthUrl: builder.mutation({
      query: () => '/admin/settings/pinterest/auth-url',
    }),

    exchangePinterestCode: builder.mutation({
      query: (body) => ({
        url: '/admin/settings/pinterest/exchange',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PinterestSettings'],
    }),

    disconnectPinterest: builder.mutation({
      query: () => ({
        url: '/admin/settings/pinterest',
        method: 'DELETE',
      }),
      invalidatesTags: ['PinterestSettings'],
    }),
  }),
});

export const {
  useGetBoardsQuery,
  useGetPinDraftQuery,
  useCreatePinMutation,
  useBulkQueuePinsMutation,
  useGetPinHistoryQuery,
  useGetPinterestAuthUrlMutation,
  useExchangePinterestCodeMutation,
  useDisconnectPinterestMutation,
} = pinterestSlice;
