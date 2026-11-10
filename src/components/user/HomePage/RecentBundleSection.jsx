import BundleCard from '@/components/Common/BundleCard';
import { HOME_GRID } from './HomeSection';

// Grid only — the header and "View all" link come from HomeSection.
const RecentBundleSection = ({ recentBundles }) => {
  const items = recentBundles?.bundles || [];

  return (
    <div className={HOME_GRID}>
      {items.map((item, index) => (
        <BundleCard key={item._id} item={item} index={index} />
      ))}
    </div>
  );
};

export default RecentBundleSection;
