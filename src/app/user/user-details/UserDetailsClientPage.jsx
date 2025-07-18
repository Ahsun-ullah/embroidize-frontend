'use client';

import { useEffect, useState } from 'react';
import UserDetailsComponent from '@/components/user/userDetails/UserDetailsComponent';

export default function UserDetailsClientPage({ searchParams }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Or a loading spinner
  }

  const defaultTab = searchParams?.tabName;

  return (
    <section className='container'>
      <UserDetailsComponent defaultTab={defaultTab} />
    </section>
  );
}
