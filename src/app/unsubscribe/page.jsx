import UnsubscribeClient from './UnsubscribeClient';

export const metadata = {
  title: 'Unsubscribe | Embroidize',
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({ searchParams }) {
  const params = await searchParams;
  const token = typeof params?.token === 'string' ? params.token : '';
  return <UnsubscribeClient token={token} />;
}
