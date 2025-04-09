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
    // category add
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
    getPublicProductCategories: builder.query({
      query: () => ({
        url: '/public/product-category',
        method: 'GET',
      }),
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
  }),
});

export const {
  useAddProductCategoryMutation,
  useUpdateProductCategoryMutation,
  useAddProductSubCategoryMutation,
  useGetPublicProductCategoriesQuery,
  useGetSinglePublicProductCategoryQuery,
  useGetPublicProductSubCategoriesQuery,
} = categoryAndSubcategorySlice;
