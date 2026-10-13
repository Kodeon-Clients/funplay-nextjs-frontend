import { NextResponse, type NextRequest } from "next/server";
import caseRedirects from "./content/case-redirects.json";

const MAP = caseRedirects as Record<string, string>;

/** Exact, case-sensitive redirects (old URLs that differ from the new ones only in letter case). */
export function proxy(req: NextRequest) {
  const to = MAP[req.nextUrl.pathname] ?? MAP[decodeURIComponent(req.nextUrl.pathname)];
  if (to) {
    const url = req.nextUrl.clone();
    url.pathname = to;
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|_img|images|fonts|files|videos|audio|api).*)"] };
