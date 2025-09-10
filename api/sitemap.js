export default async function handler(req, res) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://ton-site.vercel.app/</loc>
    </url>
  </urlset>`;
  
  res.setHeader("Content-Type", "application/xml");
  res.status(200).send(xml);
}
