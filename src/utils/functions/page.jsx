import { cookies } from 'next/headers';

export const fetchUserInfo = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  if (!token?.value) {
    console.error('Token is missing');
    return { error: 'Token is missing' };
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/userInfo`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
      },
    );

    if (!res.ok) {
      console.error('Failed to fetch user info', res.statusText);
      return { error: res.statusText };
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return { error: error.message };
  }
};

export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
}
