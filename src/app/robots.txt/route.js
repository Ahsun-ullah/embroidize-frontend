export function GET() {
  return new Response(
    `User-agent: *
    Disallow: /api/
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
