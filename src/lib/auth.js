import Cookies from 'js-cookie';

// Read the JWT's own expiry from its `exp` claim (seconds since epoch).
// Returns a Date, or null if the token is malformed / has no expiry.
export function getJwtExpiry(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const claims = JSON.parse(json);
    return claims?.exp ? new Date(claims.exp * 1000) : null;
  } catch {
    return null;
  }
}

// Store the auth token so the COOKIE expires exactly when the JWT does.
// Previously the token was saved as a session cookie with no expiry, so it
// outlived the JWT — leaving a stale token that made every authenticated
// request fail with "Unauthorized Access" while the user kept browsing.
// Falls back to a session cookie only if the token carries no `exp`.
export function setAuthToken(token) {
  const expires = getJwtExpiry(token);
  if (expires) Cookies.set('token', token, { expires });
  else Cookies.set('token', token);
}

// Drop all auth cookies. Used on explicit logout and whenever the server
// rejects the token (401), so the app cleanly falls back to a guest session
// instead of getting stuck on a dead token.
export function clearAuthToken() {
  Cookies.remove('token');
  Cookies.remove('finance_elev');
}
