import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     *Match All paths except for
     *1. /api routes
     *2. /_next (Next.js internals)
     *3. /_static (static files inside /public)
     *4. all root files inside /public (e.g. /favicon.ico)
     **/
    "/((?!api/|_next/|_static/|_vercel|media/|tenants/|[\w-]+\.\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  //extracting the hostname from the url (e.g. "parves.vendspace.com" or "parves.localhost:3000")
  const hostName = req.headers.get("host") || "";
  const rootDoamin = process.env.NEXT_PUBLIC_ROOT_DOMAIN! || "";

  if (hostName.endsWith(`.${rootDoamin}`)) {
    const tenentsSlug = hostName.replace(`.${rootDoamin}`, "");
    return NextResponse.redirect(
      new URL(`/tenants/${tenentsSlug}${url.pathname}`, req.url)
    );
  }

  return NextResponse.next();
}
