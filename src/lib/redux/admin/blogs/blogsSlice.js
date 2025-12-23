import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

export const blogsSlice = createApi({
  reducerPath: 'blogsSlice',
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
    addBlog: builder.mutation({
      query: (body) => ({
        url: '/blog',
        method: 'POST',
        body,
      }),
    }),
    updateBlog: builder.mutation({
      query: (body) => ({
        url: `/blog/${body.get('id')}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blog/${id}`,
        method: 'DELETE',
      }),
    }),
    allBlogs: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(limit));

        return {
          url: `/public/admin/blog?${params.toString()}`,
          method: 'GET',
        };
      },
    }),
    singleBlog: builder.query({
      query: (id) => {
        return {
          url: `/public/blog/${id}`,
          method: 'GET',
        };
      },
    }),
  }),
});

export const {
  useAddBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useAllBlogsQuery,
  useSingleBlogQuery,
} = blogsSlice;
