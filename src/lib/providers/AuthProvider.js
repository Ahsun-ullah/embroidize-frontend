'use client';

import GlobalLoadingPage from '@/components/Common/GlobalLoadingPage';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { useUserInfoQuery } from '../redux/common/user/userInfoSlice';

const AuthContext = createContext();

export const AuthProvider = ({
  children,
  protectedRoutes = ['/admin'],
  exactProtectedRoutes = [],
  loginPath = '/auth/login',
  defaultRedirect = '/',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { data: userInfoData, isLoading: userInfoLoading } = useUserInfoQuery();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      if (userInfoLoading) {
        return;
      }

      const token = Cookies.get('token');
      const isPrefixProtected = protectedRoutes.some((route) =>
        pathname.startsWith(route),
      );
      const isExactProtected = exactProtectedRoutes.includes(pathname);

      if (!token && (isPrefixProtected || isExactProtected)) {
        await router.push(`${loginPath}`);
        return;
      }

      const protectedRoutesForUser = [protectedRoutes[0]].some((route) =>
        pathname.startsWith(route),
      );

      if (token && (protectedRoutesForUser || isExactProtected)) {
        if (userInfoData?.role === 'user') {
          await router.push(defaultRedirect);
          return;
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [
    protectedRoutes,
    exactProtectedRoutes,
    router,
    loginPath,
    pathname,
    userInfoData,
    userInfoLoading,
    defaultRedirect,
  ]);

  return (
    <AuthContext.Provider value={''}>
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
