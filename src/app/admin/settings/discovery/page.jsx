import DiscoveryWrapper from '@/features/settings/DiscoveryWrapper';
import { getAppSettings } from '@/lib/apis/protected/appConfig';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Discovery',
};

export default async function DiscoveryPage() {
  const settings = await getAppSettings();

  return <DiscoveryWrapper settings={settings} />;
}
