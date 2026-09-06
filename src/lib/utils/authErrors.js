// Reading an error the API actually sent, instead of guessing.
//
// The backend answers failures in a consistent shape:
//
//   { success: false, message, error: { name, message, retryAfterSeconds? } }
//
// ...but RTK Query wraps that, and a request that never reached the server
// (offline, CORS, DNS, a cold container) has no `data` at all. Reaching straight
// for `error.data.message` therefore throws on exactly the failures that matter
// most, which is how a real, specific server message — "an account already
// exists from this device", "too many sign-in attempts", "that code has
// expired" — ended up rendering as a flat "Google login failed" that the
// customer could do nothing with and support could not diagnose.

// Pulls the most specific message the server gave us, falling back through the
// envelope and finally to a caller-supplied default.
export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  // Network / CORS / server-unreachable: RTK Query reports these with a string
  // status and no payload. Say so plainly — "try again" is useless advice when
  // the phone is offline.
  if (error.status === 'FETCH_ERROR') {
    return 'We couldn’t reach the server. Please check your connection and try again.';
  }
  if (error.status === 'PARSING_ERROR' || error.status === 'CUSTOM_ERROR') {
    return 'The server returned an unexpected response. Please try again in a moment.';
  }

  const data = error.data ?? error.response?.data;

  return (
    data?.error?.message ||
    data?.message ||
    error.message ||
    fallback
  );
}

// Seconds the customer must wait, when the server told us. Sent both as the
// standard Retry-After header and in the body; the body is what survives RTK
// Query, so that is what we read.
export function getRetryAfterSeconds(error) {
  const seconds = error?.data?.error?.retryAfterSeconds;
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : 0;
}

// HTTP status, when there is one.
export function getApiErrorStatus(error) {
  return typeof error?.status === 'number' ? error.status : 0;
}

// True when the failure is "you already have an account" — which is guidance,
// not an error, and should route the customer to sign-in rather than alarm them.
export function isAccountExistsError(error) {
  return (
    getApiErrorStatus(error) === 409 &&
    error?.data?.error?.name === 'Account exists'
  );
}

// 'google' | 'apple' | 'local' — which method an existing account signs in with,
// when the server told us, so the UI can point at the right button.
export function getExistingProvider(error) {
  return error?.data?.error?.provider || null;
}
