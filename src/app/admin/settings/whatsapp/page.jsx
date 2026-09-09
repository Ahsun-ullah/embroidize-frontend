import WhatsAppSettingsWrapper from '@/features/settings/WhatsAppSettingsWrapper';
import { getAppSettings } from '@/lib/apis/protected/appConfig';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'WhatsApp',
};

export default async function WhatsAppSettingsPage() {
  const settings = await getAppSettings();

  return <WhatsAppSettingsWrapper settings={settings} />;
}
