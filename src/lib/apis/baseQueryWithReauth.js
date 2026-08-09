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
//
// A blocked account answers 403, not 401, so it needs its own case — otherwise
// the browser would keep a token that every single request rejects and the app
// would sit in a broken half-logged-in state. It is matched on the specific
// "Account disabled" marker rather than on the status code, because 403 is also
// the ordinary answer to "you hit your download limit" and "premium design,
// subscribe first" — clearing the session on those would log people out mid-use.
const isDisabledAccount = (error) =>
  error?.status === 403 && error?.data?.error?.name === 'Account disabled';

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const shouldClear =
    result.error?.status === 401 || isDisabledAccount(result.error);
  if (shouldClear && Cookies.get('token')) {
    clearAuthToken();
  }
  return result;
};
