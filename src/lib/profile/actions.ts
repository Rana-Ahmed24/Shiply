"use server";

import { revalidatePath } from "next/cache";

import { fieldErrorsFromZod, mapAuthError } from "@/lib/auth/errors";
import type { AuthActionState } from "@/lib/auth/errors";
import { requireUser } from "@/lib/auth/server";
import { updateProfileFields } from "@/lib/profile/db";
import { profileEditSchema } from "@/lib/profile/schemas";
import { createClient } from "@/lib/supabase/server";

export async function updateProfileAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const user = await requireUser("/login?redirectTo=/settings");

  const languages = formData.getAll("languages") as string[];

  const parsed = profileEditSchema.safeParse({
    fullName: formData.get("fullName"),
    bio: formData.get("bio") ?? "",
    phone: formData.get("phone") ?? "",
    languages,
    meetupLocations: formData.get("meetupLocations") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await updateProfileFields(supabase, user.id, {
    full_name: parsed.data.fullName,
    bio: parsed.data.bio || null,
    phone: parsed.data.phone || null,
    languages: parsed.data.languages,
    meetup_locations: parsed.data.meetupLocations,
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  await supabase.auth.updateUser({
    data: { full_name: parsed.data.fullName },
  });

  revalidatePath(`/profile/${user.id}`);
  revalidatePath("/settings");
  revalidatePath("/");
  return { redirectTo: "/home?message=profile_updated" };
}

export async function uploadAvatarAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const user = await requireUser("/login?redirectTo=/settings");
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose an image file." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "Image must be smaller than 5MB." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { error: mapAuthError(uploadError.message) };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (profileError) {
    return { error: mapAuthError(profileError.message) };
  }

  revalidatePath(`/profile/${user.id}`);
  revalidatePath("/settings");
  return { success: "Photo updated." };
}

export async function syncTravelerTier(userId: string, dealsCompleted: number) {
  const { resolveTravelerTier } = await import("@/lib/profile/tier");
  const supabase = await createClient();
  const tier = resolveTravelerTier(dealsCompleted);
  const { error } = await supabase
    .from("profiles")
    .update({ traveler_tier: tier, deals_completed: dealsCompleted })
    .eq("id", userId);

  if (error) {
    console.warn("[profile] syncTravelerTier skipped:", error.message);
  }
}
