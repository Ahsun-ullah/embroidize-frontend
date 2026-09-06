// src/lib/utils/handleError.js

import { ErrorToast } from '@/components/Common/ErrorToast';
import { getApiErrorMessage } from './authErrors';

// Rewrites for messages that are technically accurate but unhelpful to read.
// Anything not listed passes through untouched — the API's own wording is
// written for customers and is almost always the better message.
const errorMap = {
  'User already exists': 'A user with this email already exists.',
  'Invalid credentials': 'The email or password you entered is incorrect.',
  'OTP expired': 'Your code has expired. Please request a new one.',
  'Invalid OTP': 'That code is not correct. Please check your email and try again.',
  'Duplicate key error. The data you are trying to insert already exists.':
    'An account with these details already exists. Please sign in instead.',
  'Internal Server Error':
    'Something went wrong on our side. Please try again in a moment.',
};

export const handleApiError = (error, defaultMessage = 'An unexpected error occurred.') => {
  // Goes through the shared reader so an offline / unreachable-server failure
  // is named as such instead of falling through to a generic default.
  const errorMessage = getApiErrorMessage(error, defaultMessage);
  const userFriendlyMessage = errorMap[errorMessage] || errorMessage || defaultMessage;
  ErrorToast('Error', userFriendlyMessage, 4000);
};
