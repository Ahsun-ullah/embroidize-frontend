import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { SingleProductComponent } from '@/features/products/components/SingleProductComponent';
import {
  getPopularProducts,
  getProducts,
  getSingleProduct,
} from '@/lib/apis/public/products';
import { notFound } from 'next/navigation';
import Schema from './Schema';

export default async function ProductDetails({ params }) {
  const slug = params.slug;
  const productResponse = await getSingleProduct(slug);

  if (!productResponse?.data) {
    notFound();
  }

  const product = productResponse.data;

  // Fetch popular products and all products for recommendations
  const popularProductsResponse = await getPopularProducts();
  const allProductsResponse = await getProducts();

  const popularProducts = popularProductsResponse?.data || [];
  const allProducts = allProductsResponse?.data || [];

  return (
    <>
      <Schema product={product} />
      <Header />
      <SingleProductComponent
        singleProductData={product}
        popularProducts={popularProducts}
        allProductData={allProducts}
      />
      <Footer />
    </>
  );
}
