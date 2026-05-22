import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  AUTH_ROUTE_PREFIXES,
  DEFAULT_AUTH_REDIRECT,
  DEFAULT_LOGIN_PATH,
  ONBOARDING_PATH,
  PROTECTED_ROUTE_PREFIXES,
} from "@/lib/auth/config";
import { getPublicSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";

function matchesPrefix(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

function isOnboardingComplete(
  user: { user_metadata?: Record<string, unknown> } | null
) {
  return user?.user_metadata?.onboarding_completed === true;
}

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.next({ request });
  }

  const pathname = request.nextUrl.pathname;

  try {
    const { url, anonKey } = getPublicSupabaseEnv();

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isProtected = matchesPrefix(pathname, PROTECTED_ROUTE_PREFIXES);
    const isAuthRoute =
      matchesPrefix(pathname, AUTH_ROUTE_PREFIXES) &&
      !pathname.startsWith("/auth/callback") &&
      !pathname.startsWith("/auth/confirm");
    const isOnboarding = pathname.startsWith(ONBOARDING_PATH);
    const onboardingComplete = isOnboardingComplete(user);

    if (isOnboarding && !user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = DEFAULT_LOGIN_PATH;
      redirectUrl.searchParams.set("redirectTo", ONBOARDING_PATH);
      return NextResponse.redirect(redirectUrl);
    }

    if (user && !onboardingComplete) {
      if (!isOnboarding && !pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
      }
    }

    if (user && onboardingComplete && isOnboarding) {
      return NextResponse.redirect(new URL(DEFAULT_AUTH_REDIRECT, request.url));
    }

    if (pathname === "/home") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      return NextResponse.redirect(redirectUrl);
    }

    if (isProtected && !user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = DEFAULT_LOGIN_PATH;
      redirectUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (isAuthRoute && user) {
      const redirectTo = onboardingComplete
        ? (request.nextUrl.searchParams.get("redirectTo") ??
          DEFAULT_AUTH_REDIRECT)
        : ONBOARDING_PATH;
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    return supabaseResponse;
  } catch (error) {
    console.error("[middleware] Supabase session update failed:", error);
    return NextResponse.next({ request });
  }
}
