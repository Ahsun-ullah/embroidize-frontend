'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Admin-managed public settings, fetched ONCE per page load and shared.
//
// Several client components need the same handful of numbers — the "New" badge
// window on every product card, the WhatsApp number on the floating button.
// Each fetching for itself would mean one request per card, and the layout
// cannot fetch it server-side without `cache: 'no-store'` turning every page in
// the site dynamic.
//
// Defaults matter here: a card renders before the fetch resolves and on every
// SSR pass, so the fallbacks are the same numbers the backend defaults to. A
// slow or failed config request quietly means "behave as before", never a
// blank badge or a broken button.
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULTS = {
  newBadgeDays: 7,
  recentTabDays: 30,
  whatsappNumber: '',
  whatsappMessage: '',
};

const SiteConfigContext = createContext(DEFAULTS);

export const useSiteConfig = () => useContext(SiteConfigContext);

export default function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULTS);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/site-config`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!active || !data?.data) return;
        setConfig({
          newBadgeDays: Number(data.data.newBadgeDays) || DEFAULTS.newBadgeDays,
          recentTabDays: Number(data.data.recentTabDays) || DEFAULTS.recentTabDays,
          whatsappNumber: data.data.whatsappNumber || '',
          whatsappMessage: data.data.whatsappMessage || '',
        });
      } catch {
        // Keep the defaults. Nothing here is load-bearing enough to surface.
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <SiteConfigContext.Provider value={config}>{children}</SiteConfigContext.Provider>
  );
}
