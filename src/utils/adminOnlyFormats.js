// Formats the API only ever sends to staff — mirrors
// embroidize-backend/src/helpers/adminOnlyFormats.ts. Keep the two in step.
//
// This is a LABEL, never a gate: the product page shows whatever formats the
// API returned, and the API is what decides whether the EMB is in that list and
// whether the download is allowed. Nothing here is load-bearing for access.
export const ADMIN_ONLY_FORMATS = ['emb'];

export const isAdminOnlyFormat = (type) =>
  ADMIN_ONLY_FORMATS.includes(String(type || '').toLowerCase());
