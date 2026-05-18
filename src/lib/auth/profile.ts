import "server-only";

import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  DEFAULT_AUTH_REDIRECT,
  ONBOARDING_PATH,
} from "@/lib/auth/config";
import type { Profile } from "@/lib/auth/session";
import { upsertProfileForUser } from "@/lib/auth/profile-update";
import type { Database } from "@/types/database";

type Supabase = SupabaseClient<Database>;

export async function ensureProfile(
  supabase: Supabase,
  user: User
): Promise<Profile | null> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing;

  const email = user.email ?? "";
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;

  const { data, error } = await upsertProfileForUser(supabase, {
    id: user.id,
    email,
    full_name: fullName,
    avatar_url:
      (user.user_metadata?.avatar_url as string | undefined) ??
      (user.user_metadata?.picture as string | undefined) ??
      null,
    roles: ["customer"],
    onboarding_completed: false,
  });

  if (error) {
    console.error("[auth] ensureProfile failed:", error.message);
    return null;
  }

  return data;
}

export function needsOnboarding(
  user: User,
  profile: Profile | null
): boolean {
  if (user.user_metadata?.onboarding_completed === true) return false;
  if (profile?.onboarding_completed) return false;
  return true;
}

export function resolvePostAuthPath(
  user: User,
  profile: Profile | null,
  redirectTo?: string | null
): string {
  if (needsOnboarding(user, profile)) {
    return ONBOARDING_PATH;
  }

  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    return redirectTo;
  }

  return DEFAULT_AUTH_REDIRECT;
}
