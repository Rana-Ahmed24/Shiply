import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { OnboardingRole } from "@/lib/auth/roles";
import type { AppMode } from "@/lib/mode/constants";
import type { Database } from "@/types/database";

type Supabase = SupabaseClient<Database>;

function isMissingOnboardingColumn(message: string) {
  return message.includes("onboarding_completed");
}

function isMissingPreferredModeColumn(message: string) {
  return message.includes("preferred_mode");
}

export async function updateProfileOnboarding(
  supabase: Supabase,
  userId: string,
  data: {
    full_name: string;
    roles: OnboardingRole[];
    preferred_mode?: AppMode;
    onboarding_completed?: boolean;
  }
) {
  const withFlag = {
    full_name: data.full_name,
    roles: data.roles,
    preferred_mode: data.preferred_mode ?? "customer",
    onboarding_completed: data.onboarding_completed ?? true,
  };

  const { error } = await supabase
    .from("profiles")
    .update(withFlag)
    .eq("id", userId);

  if (!error) return { error: null };

  if (isMissingPreferredModeColumn(error.message)) {
    const { preferred_mode: _mode, ...withoutMode } = withFlag;
    const retry = await supabase
      .from("profiles")
      .update(withoutMode)
      .eq("id", userId);
    if (!retry.error) return { error: null };
    if (!isMissingOnboardingColumn(retry.error.message)) return { error: retry.error };
  }

  if (!isMissingOnboardingColumn(error.message)) {
    return { error };
  }

  return supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      roles: data.roles,
    })
    .eq("id", userId);
}

export async function upsertProfileForUser(
  supabase: Supabase,
  row: Database["public"]["Tables"]["profiles"]["Insert"]
) {
  const result = await supabase.from("profiles").upsert(row).select().single();

  if (!result.error) {
    return result;
  }

  if (!isMissingOnboardingColumn(result.error.message)) {
    return result;
  }

  const { onboarding_completed: _removed, ...withoutFlag } = row;
  return supabase.from("profiles").upsert(withoutFlag).select().single();
}
