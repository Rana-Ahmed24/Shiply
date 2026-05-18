import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { ONBOARDING_PATH } from "@/lib/auth/config";
import { ensureProfile, resolvePostAuthPath } from "@/lib/auth/profile";
import { createAuthRouteClient } from "@/lib/supabase/auth-route";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/login?error=auth_confirm_failed`);
  }

  const { supabase, setRedirectPath, redirectResponse } = createAuthRouteClient(
    request,
    ONBOARDING_PATH
  );

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

  if (type === "recovery") {
    const recoveryPath =
      next?.startsWith("/") && !next.startsWith("//") ? next : "/reset-password";
    setRedirectPath(recoveryPath);
    return redirectResponse();
  }

  const path = resolvePostAuthPath(user, profile, next);
  const finalPath =
    path === "/login" ? "/login?message=email_confirmed" : path;
  setRedirectPath(finalPath);

  return redirectResponse();
}
