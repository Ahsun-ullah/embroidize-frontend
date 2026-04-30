import BypassEmailsWrapper from '@/features/settings/BypassEmailsWrapper';
import { getBypassEmails } from '@/lib/apis/protected/bypassEmails';

export const metadata = {
  title: 'Registration Bypass Emails',
};

export default async function BypassEmailsPage() {
  const items = await getBypassEmails();

  return (
    <div className='space-y-6'>
      <BypassEmailsWrapper items={items} />
    </div>
  );
}
