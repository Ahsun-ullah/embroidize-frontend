import GlobalLoadingPage from '@/components/Common/GlobalLoadingPage';
import { Suspense } from 'react';

export default function AuthLayout({ children }) {
  return <Suspense fallback={<GlobalLoadingPage />}>{children}</Suspense>;
}
