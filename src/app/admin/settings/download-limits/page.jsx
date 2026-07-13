import DownloadLimitsWrapper from '@/features/settings/DownloadLimitsWrapper';
import { getAppSettings } from '@/lib/apis/protected/appConfig';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Download Limits',
};

export default async function DownloadLimitsPage() {
  const settings = await getAppSettings();

  return <DownloadLimitsWrapper settings={settings} />;
}
