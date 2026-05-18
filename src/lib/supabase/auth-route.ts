import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getPublicSupabaseEnv, getSiteUrl } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

/** Absolute redirect URL after auth (OAuth callback, email confirm). */
export function buildAuthRedirectUrl(request: NextRequest, path: string): string {
  const { origin } = new URL(request.url);
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) {
    return `${origin}${path}`;
  }

  if (forwardedHost) {
    return `https://${forwardedHost}${path}`;
  }

  return `${siteUrl}${path}`;
}

/**
 * Supabase client for /auth/callback and /auth/confirm.
 * Session cookies must be written onto the redirect response (not only next/headers).
 */
export function createAuthRouteClient(request: NextRequest, initialPath: string) {
  const { url, anonKey } = getPublicSupabaseEnv();
  let redirectUrl = buildAuthRedirectUrl(request, initialPath);
  let supabaseResponse = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.redirect(redirectUrl);
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  function setRedirectPath(path: string) {
    const existingCookies = supabaseResponse.cookies.getAll();
    redirectUrl = buildAuthRedirectUrl(request, path);
    supabaseResponse = NextResponse.redirect(redirectUrl);
    existingCookies.forEach((cookie) => {
      supabaseResponse.cookies.set(cookie);
    });
  }

  return {
    supabase,
    setRedirectPath,
    redirectResponse: () => supabaseResponse,
  };
}
