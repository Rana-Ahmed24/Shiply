import { NextResponse } from "next/server";

import { ensureProfile, resolvePostAuthPath } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const profile = await ensureProfile(supabase, user);
  const path = resolvePostAuthPath(user, profile, next);
  const siteUrl = getSiteUrl();
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
