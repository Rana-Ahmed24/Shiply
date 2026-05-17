import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { postAuthRedirectResponse } from "@/lib/auth/post-auth-redirect";
import { ensureProfile, resolvePostAuthPath } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/login?error=auth_confirm_failed`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth_confirm_failed`);
  }

  const profile = await ensureProfile(supabase, user);
  const path = resolvePostAuthPath(user, profile, next);

  if (type === "recovery") {
    const recoveryPath =
      next?.startsWith("/") && !next.startsWith("//") ? next : "/reset-password";
    return postAuthRedirectResponse(request, recoveryPath);
  }

  if (path === "/login") {
    return postAuthRedirectResponse(
      request,
      "/login?message=email_confirmed"
    );
  }

  return postAuthRedirectResponse(request, path);
}
