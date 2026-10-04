'use client';

import { trackEventPromotionClick } from '@/lib/apis/public/eventPromotions';
import Link from 'next/link';

// The one client piece of a poster: counts the click, then navigates. Site
// paths go through next/link; full URLs (another domain) open as plain links.
export default function PromoLink({ promoId, href, className, children, ...rest }) {
  const onClick = () => trackEventPromotionClick(promoId);
  const target = href || '/products';

  if (/^https?:\/\//i.test(target)) {
    return (
      <a href={target} className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={target} prefetch={false} className={className} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}
