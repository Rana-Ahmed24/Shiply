import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { OnboardingRole } from "@/lib/auth/roles";
import type { Database } from "@/types/database";

type Supabase = SupabaseClient<Database>;

function isMissingOnboardingColumn(message: string) {
  return message.includes("onboarding_completed");
}

export async function updateProfileOnboarding(
  supabase: Supabase,
  userId: string,
  data: {
    full_name: string;
    roles: OnboardingRole[];
    onboarding_completed?: boolean;
  }
) {
  const withFlag = {
    full_name: data.full_name,
    roles: data.roles,
    onboarding_completed: data.onboarding_completed ?? true,
  };

  const { error } = await supabase
    .from("profiles")
    .update(withFlag)
    .eq("id", userId);

  if (!error) return { error: null };

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
