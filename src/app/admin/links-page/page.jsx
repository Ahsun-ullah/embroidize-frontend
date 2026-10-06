import LinkInBioWrapper from '@/features/linkInBio/LinkInBioWrapper';
import { getAdminLinkInBioItems } from '@/lib/apis/protected/linkInBio';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Links Page',
};

export default async function LinksPageAdmin() {
  const items = await getAdminLinkInBioItems();
  return (
    <div className='space-y-6'>
      <LinkInBioWrapper initialItems={items} />
    </div>
  );
}
