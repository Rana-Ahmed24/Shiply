import { type NextRequest, NextResponse } from "next/server";

import { ensureProfile, resolvePostAuthPath } from "@/lib/auth/profile";
import { ONBOARDING_PATH } from "@/lib/auth/config";
import { createAuthRouteClient } from "@/lib/supabase/auth-route";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next");

  const oauthError = searchParams.get("error");
  const oauthDescription = searchParams.get("error_description");
  if (oauthError) {
    const message = oauthDescription ?? oauthError;
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(message)}`
    );
  }

  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  if (token_hash && type) {
    const confirmUrl = new URL(`${origin}/auth/confirm`);
    searchParams.forEach((value, key) => {
      confirmUrl.searchParams.set(key, value);
    });
    return NextResponse.redirect(confirmUrl);
  }

  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const { supabase, setRedirectPath, redirectResponse } = createAuthRouteClient(
    request,
    ONBOARDING_PATH
  );

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
  setRedirectPath(path);

  return redirectResponse();
}
