import PlansWrapper from '@/features/plans/PlansWrapper';
import { getAdminPlans } from '@/lib/apis/protected/plans';

export const dynamic = 'force-dynamic';

export default async function PlansPage() {
  const plans = await getAdminPlans();

  return (
    <div className='space-y-6'>
      <PlansWrapper plans={plans} />
    </div>
  );
}
