export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://nanobanana-ai.dev"
  const body = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${base}/sitemap.xml`,
  ].join("\n")
  return new Response(body, { headers: { "Content-Type": "text/plain" } })
}
