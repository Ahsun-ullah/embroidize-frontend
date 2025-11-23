// src/lib/utils/handleError.js

import { ErrorToast } from '@/components/Common/ErrorToast';

const errorMap = {
  'User already exists': 'A user with this email already exists.',
  'Invalid credentials': 'The email or password you entered is incorrect.',
  'OTP expired': 'The OTP has expired. Please request a new one.',
  'Invalid OTP': 'The OTP you entered is incorrect.',
  // Add more known error messages here
};

export const handleApiError = (error, defaultMessage = 'An unexpected error occurred.') => {
  const errorMessage = error?.data?.message || error?.message || defaultMessage;
  const userFriendlyMessage = errorMap[errorMessage] || defaultMessage;
  ErrorToast('Error', userFriendlyMessage, 3000);
};
