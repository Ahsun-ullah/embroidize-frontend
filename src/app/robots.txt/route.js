export function GET() {
  return new Response(
    `User-agent: *
    Disallow: /api/
    Disallow: /admin/
    Disallow: /auth/
    Disallow: /reset-password
    Disallow: /search
    Disallow: /user
    Allow: /


  Sitemap: https://embroidize.com/sitemap.xml`,
    {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=0, s-maxage=3600',
      },
    },
  );
}
