import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { VIEW_COOKIE, tokenFor } from "@/lib/auth";

export function proxy(req: NextRequest) {
  const viewPassword = process.env.OPIKA_VIEW_PASSWORD;
  if (!viewPassword) return NextResponse.next(); // no gate configured — leave open

  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/login")) return NextResponse.next();

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
