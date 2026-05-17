import { headers } from "next/headers";

import { getSiteUrl } from "@/lib/supabase/env";

function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

export function isLocalDevUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/** Base URL for auth redirects (emails, OAuth). Prefer a public NEXT_PUBLIC_SITE_URL. */
export async function getAuthBaseUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && !isLocalDevUrl(configured)) {
    return stripTrailingSlash(configured);
  }

  try {
    const headersList = await headers();
    const host =
      headersList.get("x-forwarded-host") ?? headersList.get("host");
    const proto =
      headersList.get("x-forwarded-proto") ??
      (host && isLocalDevUrl(host) ? "http" : "https");
    if (host) {
      return stripTrailingSlash(`${proto}://${host}`);
    }
  } catch {
    // headers() not available outside a request
  }

  return stripTrailingSlash(getSiteUrl());
}

export async function authConfirmUrl(next: string) {
  const base = await getAuthBaseUrl();
  return `${base}/auth/confirm?next=${encodeURIComponent(next)}`;
}

export async function authCallbackUrl(next: string) {
  const base = await getAuthBaseUrl();
  return `${base}/auth/callback?next=${encodeURIComponent(next)}`;
}
