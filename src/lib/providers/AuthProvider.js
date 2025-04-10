'use client';

import GlobalLoadingPage from '@/app/loading';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({
  children,
  protectedRoutes = ['/admin'],
  exactProtectedRoutes = [],
  loginPath = '/auth/login',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      const token = Cookies.get('token');
      const isPrefixProtected = protectedRoutes.some((route) =>
        pathname.startsWith(route),
      );
      const isExactProtected = exactProtectedRoutes.includes(pathname);

      if (!token && (isPrefixProtected || isExactProtected)) {
        console.log('Redirecting to:', loginPath);
        await router.push(`${loginPath}`);
        return;
      }

      console.log('Auth check complete, setting isLoading to false');
      setIsLoading(false);
    };

    checkAuth();
  }, [protectedRoutes, exactProtectedRoutes, router, loginPath, pathname]); 

  const value = {
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? <GlobalLoadingPage /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
