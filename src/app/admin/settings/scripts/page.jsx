import ScriptsWrapper from '@/features/settings/ScriptsWrapper';
import { getAdminActionLog } from '@/lib/apis/protected/adminScripts';

export const metadata = {
  title: 'Admin Scripts',
};

export default async function AdminScriptsPage() {
  const initialAuditLog = await getAdminActionLog({ page: 1, limit: 20 });

  return (
    <div className='space-y-6'>
      <ScriptsWrapper initialAuditLog={initialAuditLog} />
    </div>
  );
}
