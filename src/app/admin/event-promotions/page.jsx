import EventPromotionsWrapper from '@/features/eventPromotions/EventPromotionsWrapper';
import { getEventPromotions } from '@/lib/apis/protected/eventPromotions';
import { getCategories } from '@/lib/apis/public/category';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Event Promotions',
};

export default async function EventPromotionsPage() {
  // /public/product-category returns every category with its subcategories
  // nested, which is exactly what the picker needs.
  const [items, categoryData] = await Promise.all([
    getEventPromotions(),
    getCategories('', 0, 1000).catch(() => ({ categories: [] })),
  ]);

  return (
    <div className='space-y-6'>
      <EventPromotionsWrapper
        items={items}
        categories={Array.isArray(categoryData?.categories) ? categoryData.categories : []}
      />
    </div>
  );
}
