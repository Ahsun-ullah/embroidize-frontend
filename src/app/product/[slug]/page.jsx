import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { SingleProductComponent } from '@/features/products/components/SingleProductComponent';
import { getAllProductsByCategory } from '@/lib/apis/public/category';
import {
  getPopularProducts,
  getSingleProduct,
} from '@/lib/apis/public/products';
import { getAllProductsBySubCategory } from '@/lib/apis/public/subcategory';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const response = await getSingleProduct(params.slug);
  const product = response?.data;

  if (!product) return {};
  const canonicalUrl = `https://embroidize.com/product/${params.slug}`;

  return {
    title: product.meta_title,
    description: product.meta_description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: product.meta_title,
      description: product.meta_description,
      images: [
        {
          url: product.image?.url || 'https://embroidize.com/og-banner.jpg',
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.meta_title,
      description: product.meta_description,
      images: [product.image?.url || 'https://embroidize.com/og-banner.jpg'],
      alt: product.name,
    },
  };
}

export default async function ProductDetails({ params }) {
  const slug = params.slug;

  const response = await getSingleProduct(slug);
  const product = response?.data;

  if (!product) return notFound();

  const hasSubCategory = !!product?.sub_category?.slug;

  const [productListResponse, popularProductsResponse] = await Promise.all([
    hasSubCategory
      ? getAllProductsBySubCategory(product.sub_category.slug, 1, 6)
      : getAllProductsByCategory(product.category?.slug, 1, 6),
    getPopularProducts('', 1, 4),
  ]);

  const allProducts = productListResponse?.products ?? [];
  const popularProducts = popularProductsResponse?.products ?? [];

  const today = new Date();
  const oneYearLater = new Date(
    today.getFullYear() + 1,
    today.getMonth(),
    today.getDate(),
  );
  const oneYearLaterMS = oneYearLater.getTime();
  const priceValidUntil = new Date(oneYearLaterMS).toISOString().split('T')[0];
  
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.meta_description,
    sku: product.sku || product._id,
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || 'Embroidize',
    },
    offers: {
      '@type': 'Offer',
      url: `https://embroidize.com/product/${product.slug}`,
      priceCurrency: 'USD',
      price: product.price === 0 ? '0.00' : product.price.toFixed(2),
      availability: 'https://schema.org/InStock',
      priceValidUntil: priceValidUntil,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Embroidize',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: product.price === 0 ? '0.00' : product.price.toFixed(2),
          currency: 'USD',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'US',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 0,
            unitCode: 'd',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 0,
            unitCode: 'd',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        name: 'Digital Product – No Returns',
        description: 'This is a digital product and is non-refundable.',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
        applicableCountry: 'US',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://embroidize.com/product/${product.slug}`,
      },
    },
    category: 'DigitalEmbroideryDesign',
  };

  if (product.image?.url) {
    schema.image = product.image.url;
  }

  if (product.rating && product.reviews?.length > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.average || 5.0,
      reviewCount: product.reviews.length,
      bestRating: 5,
      worstRating: 1,
    };
    schema.review = product.reviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author || 'Anonymous',
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating || 5.0,
        bestRating: 5.0,
        worstRating: 1,
      },
      reviewBody: review.comment || '',
    }));
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://embroidize.com/',
      },
    ],
  };

  if (product.category) {
    breadcrumb.itemListElement.push({
      '@type': 'ListItem',
      position: 2,
      name: product.category.name,
      item: `https://embroidize.com/${product.category.slug}`,
    });
  }

  if (product.sub_category) {
    breadcrumb.itemListElement.push({
      '@type': 'ListItem',
      position: 3,
      name: product.sub_category.name,
      item: `https://embroidize.com/${product.category.slug}/${product.sub_category.slug}`,
    });
  }

  breadcrumb.itemListElement.push({
    '@type': 'ListItem',
    position: product.sub_category ? 4 : 3,
    name: product.name,
    item: `https://embroidize.com/product/${product.slug}`,
  });

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <Header />
      <SingleProductComponent
        singleProductData={product}
        allProductData={allProducts}
        popularProducts={popularProducts}
      />
      <Footer />
    </>
  );
}
