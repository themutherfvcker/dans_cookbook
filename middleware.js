export function middleware(request) {
  const url = request.nextUrl.clone();
  const host = url.hostname;

  if (host && host.startsWith("www.")) {
    url.hostname = host.replace(/^www\./, "");
    return Response.redirect(url, 308);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

