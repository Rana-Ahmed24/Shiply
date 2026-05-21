"use server";

import { revalidatePath } from "next/cache";

import {
  fieldErrorsFromZod,
  mapAuthError,
  type AuthActionState,
} from "@/lib/auth/errors";
import { requireAdmin } from "@/lib/auth/require-admin";
import { requireUser } from "@/lib/auth/server";
import {
  DOC_FIELD_NAMES,
  TRAVELER_VERIFICATION_BUCKET,
  VERIFICATION_ACCEPTED_TYPES,
  VERIFICATION_MAX_BYTES,
} from "@/lib/verification/constants";
import { getTravelerVerification } from "@/lib/verification/queries";
import {
  createSignedVerificationUrl,
  verificationUploadPath,
} from "@/lib/verification/storage";
import { createClient } from "@/lib/supabase/server";
import type { TravelerVerificationDocKind } from "@/types/traveler-verification";
import { z } from "zod";

const docKindSchema = z.enum(["passport", "selfie", "ticket"]);

function parseDocKind(formData: FormData): TravelerVerificationDocKind | null {
  const parsed = docKindSchema.safeParse(formData.get("kind"));
  return parsed.success ? parsed.data : null;
}

async function ensureVerificationRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const existing = await getTravelerVerification(userId);
  if (existing.id) return existing;

  const { error } = await supabase.from("traveler_verifications").insert({
    user_id: userId,
    status: "not_submitted",
  });

  if (error) {
    throw new Error(mapAuthError(error.message));
  }

  return getTravelerVerification(userId);
}

export async function uploadVerificationDocAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const user = await requireUser("/login?redirectTo=/verify-traveler");
  const kind = parseDocKind(formData);
  const file = formData.get("file");

  if (!kind) {
    return { error: "Invalid document type." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }

  if (file.size > VERIFICATION_MAX_BYTES) {
    return { error: "File must be smaller than 5MB." };
  }

  if (
    !VERIFICATION_ACCEPTED_TYPES.includes(
      file.type as (typeof VERIFICATION_ACCEPTED_TYPES)[number]
    )
  ) {
    return { error: "Use JPEG, PNG, WebP, or PDF." };
  }

  const supabase = await createClient();
  const view = await ensureVerificationRow(supabase, user.id);

  if (view.status === "pending") {
    return { error: "Your verification is under review. You cannot change documents yet." };
  }

  if (view.status === "verified") {
    return { error: "You are already verified." };
  }

  const path = verificationUploadPath(user.id, kind, file);
  const field = DOC_FIELD_NAMES[kind];

  const { error: uploadError } = await supabase.storage
    .from(TRAVELER_VERIFICATION_BUCKET)
    .upload(path, file, {
      contentType: file.type || undefined,
      upsert: true,
    });

  if (uploadError) {
    return { error: mapAuthError(uploadError.message) };
  }

  const { error: updateError } = await supabase
    .from("traveler_verifications")
    .update({
      [field]: path,
      ...(view.status === "rejected"
        ? { status: "not_submitted", rejection_reason: null }
        : {}),
    })
    .eq("user_id", user.id);

  if (updateError) {
    return { error: mapAuthError(updateError.message) };
  }

  revalidatePath("/verify-traveler");
  revalidatePath("/profile");
  return { success: "Document uploaded." };
}

export async function submitTravelerVerificationAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  void formData;
  const user = await requireUser("/login?redirectTo=/verify-traveler");
  const supabase = await createClient();
  const view = await ensureVerificationRow(supabase, user.id);

  if (view.status === "pending") {
    return { error: "Your verification is already under review." };
  }

  if (view.status === "verified") {
    return { error: "You are already verified." };
  }

  if (!view.hasPassport || !view.hasSelfie || !view.hasTicket) {
    return {
      error: "Upload passport, selfie, and flight ticket before submitting.",
    };
  }

  const { error } = await supabase
    .from("traveler_verifications")
    .update({
      status: "pending",
      rejection_reason: null,
      reviewed_by: null,
      reviewed_at: null,
    })
    .eq("user_id", user.id);

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  revalidatePath("/verify-traveler");
  revalidatePath("/profile");
  revalidatePath("/admin/verifications");
  revalidatePath("/");

  return { success: "Verification submitted for review." };
}

const rejectSchema = z.object({
  verificationId: z.string().uuid(),
  reason: z.string().trim().min(3, "Enter a rejection reason (at least 3 characters)."),
});

export async function approveVerificationAction(
  verificationId: string
): Promise<AuthActionState> {
  await requireAdmin();
  const supabase = await createClient();
  const user = await requireUser();

  const { error } = await supabase
    .from("traveler_verifications")
    .update({
      status: "verified",
      rejection_reason: null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", verificationId);

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  revalidatePath("/admin/verifications");
  revalidatePath("/");
  return { success: "Traveler verified." };
}

export async function rejectVerificationAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  await requireAdmin();
  const parsed = rejectSchema.safeParse({
    verificationId: formData.get("verificationId"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const supabase = await createClient();
  const user = await requireUser();

  const { error } = await supabase
    .from("traveler_verifications")
    .update({
      status: "rejected",
      rejection_reason: parsed.data.reason,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.verificationId);

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  revalidatePath("/admin/verifications");
  return { success: "Verification rejected." };
}

export async function getVerificationSignedUrlAction(
  storagePath: string
): Promise<{ url: string | null; error?: string }> {
  const user = await requireUser();
  const supabase = await createClient();

  const folder = storagePath.split("/")[0];
  if (folder !== user.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("roles")
      .eq("id", user.id)
      .single();
    const { hasRole } = await import("@/lib/auth/roles");
    if (!hasRole(profile?.roles as ("admin")[] | undefined, "admin")) {
      return { url: null, error: "Access denied." };
    }
  }

  const url = await createSignedVerificationUrl(supabase, storagePath);
  return { url };
}
