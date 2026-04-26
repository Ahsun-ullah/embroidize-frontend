'use client';

import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import Cookies from 'js-cookie';
import { useEffect, useRef } from 'react';

export default function ChatIdentify() {
  const { data: userInfo } = useUserInfoQuery();
  const tawkIdentified = useRef(false);
  const crispIdentified = useRef(false);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token || !userInfo?.email) return;

    // ── Tawk.to (tracking only — widget is hidden) ──────────────────────────
    if (!tawkIdentified.current) {
      const waitForTawk = (attempts = 0) => {
        if (attempts > 20) return;
        const api = window.Tawk_API;
        if (api && typeof api.setAttributes === 'function') {
          api.setAttributes(
            { name: userInfo.name || '', email: userInfo.email },
            (error) => { if (!error) tawkIdentified.current = true; }
          );
        } else {
          setTimeout(() => waitForTawk(attempts + 1), 500);
        }
      };
      waitForTawk();
    }

    // ── Crisp (chat widget — identify for async email replies) ───────────────
    if (!crispIdentified.current) {
      const waitForCrisp = (attempts = 0) => {
        if (attempts > 20) return;
        if (window.$crisp) {
          window.$crisp.push(['set', 'user:email', [userInfo.email]]);
          window.$crisp.push(['set', 'user:nickname', [userInfo.name || '']]);
          crispIdentified.current = true;
        } else {
          setTimeout(() => waitForCrisp(attempts + 1), 500);
        }
      };
      waitForCrisp();
    }
  }, [userInfo?.email]);

  return null;
}
