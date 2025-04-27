export function GET() {
  return new Response(
    `User-agent: *
    Disallow: /api/
    Allow: /


  Sitemap: https://embro-id.vercel.app/sitemap.xml`,
    {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=0, s-maxage=3600',
      },
    },
  );
}
