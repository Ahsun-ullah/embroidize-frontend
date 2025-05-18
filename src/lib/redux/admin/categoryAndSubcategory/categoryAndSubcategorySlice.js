import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

export const categoryAndSubcategorySlice = createApi({
  reducerPath: 'categoryAndSubcategorySlice',
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
    // category add
    addProductCategory: builder.mutation({
      query: (body) => ({
        url: '/product-category',
        method: 'POST',
        body,
      }),
    }),
    // category update
    updateProductCategory: builder.mutation({
      query: (body) => {
        const id = body.get('id');
        return {
          url: `/product-category/${id}`,
          method: 'PUT',
          body,
        };
      },
    }),
    // subcategory add
    addProductSubCategory: builder.mutation({
      query: (body) => ({
        url: '/product-subcategory',
        method: 'POST',
        body,
      }),
    }),
    // subcategory update
    updateProductSubCategory: builder.mutation({
      query: (body) => {
        const id = body.get('id');
        return {
          url: `/product-subcategory/${id}`,
          method: 'PUT',
          body,
        };
      },
    }),
    // getPublicProductCategories: builder.query({
    //   query: () => ({
    //     url: '/public/product-category',
    //     method: 'GET',
    //   }),
    // }),
    getPublicProductCategories: builder.query({
      query: () => ({
        url: '/public/product-category',
        method: 'GET',
      }),
      // Cache the data for 24 hours (in seconds)
      keepUnusedDataFor: 86400,
      // Don't auto-refetch on mount or arg change
      refetchOnMountOrArgChange: false,
      refetchOnReconnect: false,
    }),

    getSinglePublicProductCategory: builder.query({
      query: (id) => ({
        url: `/public/product-category/${id}`,
        method: 'GET',
      }),
    }),
    getPublicProductSubCategories: builder.query({
      query: () => ({
        url: '/public/product-subcategory',
        method: 'GET',
      }),
    }),
    getSinglePublicProductSubCategory: builder.query({
      query: (id) => ({
        url: `/public/product-subcategory/${id}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useAddProductCategoryMutation,
  useUpdateProductCategoryMutation,
  useAddProductSubCategoryMutation,
  useUpdateProductSubCategoryMutation,
  useGetPublicProductCategoriesQuery,
  useGetSinglePublicProductCategoryQuery,
  useGetPublicProductSubCategoriesQuery,
  useGetSinglePublicProductSubCategoryQuery,
} = categoryAndSubcategorySlice;
