import { cookies } from 'next/headers';

export async function getBlogs(searchQuery, currentPage = 0, perPageData = 8) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.append('search', searchQuery);
    queryParams.append('page', (currentPage + 1).toString());
    queryParams.append('limit', perPageData.toString());

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/blog?${queryParams.toString()}`;

    const response = await fetch(apiUrl, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();

    return {
      blogs: result.data,
      //   totalCount: result.meta.length,
      //   page: result.meta.page,
      //   totalPages: result.data.meta.totalPages,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getSingleBlog(blogId) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    const headers = new Headers();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/blog/${blogId}`,
      {
        headers,
        cache: 'no-store',
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
