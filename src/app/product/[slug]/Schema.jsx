
const Schema = ({ product }) => {
  if (!product) {
    return null;
  }

  const today = new Date();
  const priceValidUntil = new Date(
    today.getFullYear() + 1,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split('T')[0];

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.meta_description,
    sku: product.sku || product._id,
    image: product.image?.url,
    brand: { '@type': 'Brand', name: 'Embroidize' },
    offers: {
      '@type': 'Offer',
      url: `https://embroidize.com/product/${product.slug}`,
      priceCurrency: 'USD',
      price: Number(product.price || 0).toFixed(2),
      availability: 'https://schema.org/InStock',
      priceValidUntil,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'Embroidize' },
    },
  };

  if (product.rating && product.reviews?.length > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.average || 5.0,
      reviewCount: product.reviews.length,
    };
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
      ...(product.category
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: product.category.name,
              item: `https://embroidize.com/${product.category.slug}`,
            },
          ]
        : []),
      ...(product.sub_category
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.sub_category.name,
              item: `https://embroidize.com/${product.category.slug}/${product.sub_category.slug}`,
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: product.sub_category ? 4 : 3,
        name: product.name,
        item: `https://embroidize.com/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
};

export default Schema;
