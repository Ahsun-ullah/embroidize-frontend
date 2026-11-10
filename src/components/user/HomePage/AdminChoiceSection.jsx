import ProductCard from '@/components/Common/ProductCard';
import { HOME_GRID } from './HomeSection';

// Grid only — the header and "View all" link come from HomeSection.
const AdminChoiceDesign = ({ adminChoiceProducts }) => {
  const items = adminChoiceProducts?.products || [];

  return (
    <div className={HOME_GRID}>
      {items.map((item, index) => (
        <ProductCard key={item._id} item={item} index={index} />
      ))}
    </div>
  );
};

export default AdminChoiceDesign;
