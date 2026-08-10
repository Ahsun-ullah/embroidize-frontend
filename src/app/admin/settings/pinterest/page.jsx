import PinterestConfigWrapper from '@/features/settings/PinterestConfigWrapper';
import { getPinterestSettings } from '@/lib/apis/protected/pinterestConfig';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pinterest',
};

export default async function PinterestSettingsPage() {
  const settings = await getPinterestSettings();

  return (
    <div className='space-y-6'>
      <PinterestConfigWrapper settings={settings} />
    </div>
  );
}
