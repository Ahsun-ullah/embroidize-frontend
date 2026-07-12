import RedirectsWrapper from '@/features/settings/RedirectsWrapper';
import { getRedirects } from '@/lib/apis/protected/redirects';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'URL Redirects',
};

export default async function RedirectsPage() {
  const items = await getRedirects();

  return (
    <div className='space-y-6'>
      <RedirectsWrapper items={items} />
    </div>
  );
}
