import { NextResponse } from "next/server";

import { getSiteUrl } from "@/lib/supabase/env";

export function postAuthRedirectResponse(request: Request, path: string) {
  const { origin } = new URL(request.url);
  const siteUrl = stripTrailingSlash(getSiteUrl());
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${path}`);
  }

  if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${path}`);
  }

  return NextResponse.redirect(`${siteUrl}${path}`);
}

function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}
