import { clearAuthToken } from '@/lib/auth';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_API_URL,
  prepareHeaders: (headers) => {
    const token = Cookies.get('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// Shared base query for authenticated RTK Query APIs. On a 401 (expired/invalid
// session) it purges the dead token cookie, so the app auto-logs-out instead of
// staying stuck on a token every request rejects. Passive calls (userinfo,
// favorite ids) then just read as a guest; explicit auth actions send the user
// to the login page from their own handlers. Guests (no token) are untouched.
export const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401 && Cookies.get('token')) {
    clearAuthToken();
  }
  return result;
};
