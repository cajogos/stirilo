import { NextResponse, type NextRequest } from "next/server";
import { PUBLIC_ROUTES, SESSION_COOKIE } from "@/lib/auth-constants";

// Coarse edge-level gate: redirect to /login when no session cookie is present.
// Authoritative session validation happens server-side in getCurrentSession();
// Phase 2b tightens this without changing the redirect behaviour.
export function middleware(request: NextRequest): NextResponse
{
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!isPublic && !hasSession)
  {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && hasSession)
  {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
