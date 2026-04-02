// utils/categoryCache.js

const CACHE_KEY = 'embroidize_categories';
const CACHE_TIME_KEY = 'embroidize_categories_time';

const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;

export const getCachedCategories = () => {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    const time = localStorage.getItem(CACHE_TIME_KEY);

    if (!data || !time) return null;

    const isExpired = Date.now() - Number(time) > ONE_MONTH;

    if (isExpired) return null;

    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const setCachedCategories = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
  } catch {}
};
