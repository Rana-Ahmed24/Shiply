import { NextResponse } from "next/server";

import { postAuthRedirectResponse } from "@/lib/auth/post-auth-redirect";
import { ensureProfile, resolvePostAuthPath } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
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

  return postAuthRedirectResponse(request, path);
}
