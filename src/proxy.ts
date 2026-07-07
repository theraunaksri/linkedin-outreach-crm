import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { VIEW_COOKIE, tokenFor } from "@/lib/auth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/login")) return NextResponse.next();

  const viewPassword = process.env.OPIKA_VIEW_PASSWORD;
  // Fail closed: a missing password must block access, not silently expose
  // the whole app. /login renders a "not configured" message in this case.
  if (!viewPassword) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("unconfigured", "1");
    return NextResponse.redirect(url);
  }

  const cookie = req.cookies.get(VIEW_COOKIE)?.value;
  if (cookie === tokenFor(viewPassword)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
