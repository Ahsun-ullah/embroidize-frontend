export async function getBlogs(searchQuery, currentPage, perPageData) {
  try {
    const headers = new Headers();
    headers.set('Authorization', 'Bearer some-static-token');

    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.append('search', searchQuery);
    if (currentPage) queryParams.append('page', currentPage.toString());
    if (perPageData) queryParams.append('limit', perPageData.toString());

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/blog?${queryParams.toString()}`;

    const response = await fetch(apiUrl, {
      headers,
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();

    return {
      blogs: result.data.blogs,
      totalCount: result.data.pagination.totalItems,
      page: result.data.pagination.currentPage,
      totalPages: result.data.pagination.totalPages,
    };
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
}

export async function getSingleBlog(slug) {
  try {
    const headers = new Headers();
    headers.set('Authorization', 'Bearer some-static-token');

    console.log(
      'apirul',
      `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/blog/${slug}`,
    );

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/blog/${slug}`,
      {
        headers,
        cache: 'no-store',
        next: { revalidate: 0 },
      },
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    return {
      blogs: result.data,
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}
