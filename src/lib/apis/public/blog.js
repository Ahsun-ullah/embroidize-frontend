export async function getBlogs(searchQuery, currentPage, perPageData) {
  try {
    const headers = new Headers();
    headers.set('Authorization', 'Bearer some-static-token');

    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.append('search', searchQuery);
    if (currentPage) queryParams.append('page', currentPage.toString());
    if (perPageData) queryParams.append('limit', perPageData.toString());

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/blog?${queryParams.toString()}`;
    console.log(apiUrl);
    const response = await fetch(apiUrl, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();

    return {
      blogs: result.data.blogs,
      pagination: result.data.pagination,
    };
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
}
