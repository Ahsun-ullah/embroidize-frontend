'use client';
import { Spinner } from '@heroui/react';

const GlobalLoadingPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Spinner color='white' label='Loading...' />
    </div>
  );
};

export default GlobalLoadingPage;
