function url(loc, priority = "0.8") {
  const lastmod = new Date().toISOString()
  return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>daily</changefreq><priority>${priority}</priority></url>`
}

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://nanobanana-ai.dev"
  const urls = [
    url(`${base}/`, "1.0"),
    url(`${base}/docs`, "0.7"),
    url(`${base}/privacy`, "0.4"),
    url(`${base}/terms`, "0.4"),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.join("\n")}
  </urlset>`
  return new Response(xml, { headers: { "Content-Type": "application/xml" } })
}
