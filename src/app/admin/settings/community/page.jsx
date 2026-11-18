import CommunitySettingsWrapper from '@/features/settings/CommunitySettingsWrapper';
import { getAppSettings } from '@/lib/apis/protected/appConfig';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Community',
};

export default async function CommunitySettingsPage() {
  const settings = await getAppSettings();

  return <CommunitySettingsWrapper settings={settings} />;
}
