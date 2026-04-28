'use client';

import { useEffect, useState } from 'react';

const SESSION_KEY = '__embroidize_fp';

export function useFingerprint() {
  const [fingerprint, setFingerprint] = useState('');

  useEffect(() => {
    // Return cached value from this session to avoid recomputing on every render
    try {
      const cached = sessionStorage.getItem(SESSION_KEY);
      if (cached) {
        setFingerprint(cached);
        return;
      }
    } catch {
      // sessionStorage may be blocked in some browsers
    }

    import('@fingerprintjs/fingerprintjs').then((FingerprintJS) =>
      FingerprintJS.load()
    ).then((fp) => fp.get()).then((result) => {
      try {
        sessionStorage.setItem(SESSION_KEY, result.visitorId);
      } catch {
        // ignore storage errors
      }
      setFingerprint(result.visitorId);
    }).catch(() => {
      // fail silently — backend treats empty fingerprint as "not available"
    });
  }, []);

  return fingerprint;
}
