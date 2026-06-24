'use client';

import Cookies from 'js-cookie';

// Session cookie (no `expires`) holding the Financial elevation token.
// It lives on the frontend origin so SSR can read it via next/headers and
// forward it to the backend; it clears when the browser closes or on logout.
export const FINANCE_COOKIE = 'finance_elev';

export const setFinanceToken = (token) =>
  Cookies.set(FINANCE_COOKIE, token, { sameSite: 'strict' });

export const getFinanceToken = () => Cookies.get(FINANCE_COOKIE);

export const clearFinanceToken = () => Cookies.remove(FINANCE_COOKIE);
