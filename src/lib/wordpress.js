const API_URL = process.env.NEXT_PUBLIC_WORD_PRESS_LINK;

export async function getPosts(limit = 10) {
  const res = await fetch(`${API_URL}/posts?per_page=${limit}`);
  const posts = await res.json();

  if (!posts || !posts.length) return [];

  const postsWithImages = await Promise.all(
    posts.map(async (post) => {
      const featuredMediaUrl = post._links?.['wp:featuredmedia']?.[0]?.href;
      let featuredImage = null;

      if (featuredMediaUrl) {
        try {
          const featuredImageRes = await fetch(featuredMediaUrl);
          const featuredImageData = await featuredImageRes.json();
          featuredImage = featuredImageData?.guid?.rendered || null;
        } catch (err) {
          console.error(
            `Failed to fetch featured image for post: ${post.id}`,
            err,
          );
        }
      }

      return {
        ...post,
        featuredImage,
      };
    }),
  );

  return postsWithImages;
}

export async function getPostBySlug(slug) {
  const res = await fetch(`${API_URL}/posts?slug=${slug}&_embedded`);
  const data = await res.json();

  const featuredImageRes = await fetch(
    data[0]?._links?.['wp:featuredmedia']?.[0]?.href,
  );

  const featuredImageData = await featuredImageRes.json();

  if (!data.length) return null;

  const post = data[0];
  return {
    ...post,
    featuredImage: featuredImageData?.guid?.rendered,
  };
}
