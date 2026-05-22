"use server";

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
import { revalidateVerificationSurfaces } from "@/lib/verification/revalidate";
import {
  userOwnsVerificationFolder,
  verificationFolderFromPath,
  verificationStorageFolder,
} from "@/lib/verification/folder";
import {
  createSignedVerificationUrl,
  verificationUploadPath,
} from "@/lib/verification/storage";
import { createAdminClient } from "@/lib/supabase/admin";
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

function isStorageRlsError(message: string): boolean {
  return message.toLowerCase().includes("row-level security");
}

async function uploadVerificationObject(
  userId: string,
  storagePath: string,
  file: File
): Promise<{ error: string | null }> {
  const folder = verificationFolderFromPath(storagePath);
  if (!userOwnsVerificationFolder(folder, userId)) {
    return { error: "Invalid upload path." };
  }

  const options = {
    contentType: file.type || undefined,
    upsert: true as const,
  };

  const supabase = await createClient();
  const { error: clientError } = await supabase.storage
    .from(TRAVELER_VERIFICATION_BUCKET)
    .upload(storagePath, file, options);

  if (!clientError) return { error: null };

  if (!isStorageRlsError(clientError.message)) {
    return { error: mapAuthError(clientError.message) };
  }

  try {
    const admin = createAdminClient();
    const { error: adminError } = await admin.storage
      .from(TRAVELER_VERIFICATION_BUCKET)
      .upload(storagePath, file, options);

    if (adminError) {
      return { error: mapAuthError(adminError.message) };
    }
    return { error: null };
  } catch {
    return { error: mapAuthError(clientError.message) };
  }
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const folder = verificationStorageFolder(
    user.id,
    profile?.full_name as string | null | undefined
  );
  const path = verificationUploadPath(folder, kind, file);
  const field = DOC_FIELD_NAMES[kind];

  const { error: uploadError } = await uploadVerificationObject(
    user.id,
    path,
    file
  );

  if (uploadError) {
    return { error: uploadError };
  }

  const { error: updateError } = await supabase
    .from("traveler_verifications")
    .update({
      [field]: path,
      ...(view.status === "rejected" || view.status === "invalid"
        ? { status: "not_submitted", rejection_reason: null }
        : {}),
    })
    .eq("user_id", user.id);

  if (updateError) {
    return { error: mapAuthError(updateError.message) };
  }

  revalidateVerificationSurfaces();
  return { success: "Document uploaded." };
}

/** Clear all verification files (storage + DB) so the traveler uploads from scratch. */
export async function resetTravelerVerificationAction(): Promise<AuthActionState> {
  const user = await requireUser("/login?redirectTo=/verify-traveler");
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const folderCandidates = new Set([
    user.id,
    verificationStorageFolder(
      user.id,
      profile?.full_name as string | null | undefined
    ),
  ]);

  try {
    const admin = createAdminClient();
    for (const folder of folderCandidates) {
      const { data: listed } = await admin.storage
        .from(TRAVELER_VERIFICATION_BUCKET)
        .list(folder);
      const paths = (listed ?? [])
        .filter((item) => item.name && !item.name.endsWith("/"))
        .map((item) => `${folder}/${item.name}`);
      if (paths.length > 0) {
        await admin.storage.from(TRAVELER_VERIFICATION_BUCKET).remove(paths);
      }
    }

    const { error } = await admin
      .from("traveler_verifications")
      .update({
        passport_url: null,
        selfie_url: null,
        ticket_url: null,
        status: "not_submitted",
        rejection_reason: null,
        reviewed_by: null,
        reviewed_at: null,
      })
      .eq("user_id", user.id);

    if (error) {
      return { error: mapAuthError(error.message) };
    }
  } catch (err) {
    console.error("[verification] reset:", err);
    return {
      error:
        "Could not reset verification. Ensure SUPABASE_SERVICE_ROLE_KEY is set, or clear files in Supabase Storage manually.",
    };
  }

  revalidateVerificationSurfaces();

  return {
    success: "Verification cleared. Upload passport, selfie, and ticket again.",
  };
}

/** Withdraw pending/verified review so the traveler can replace documents. */
export async function beginVerificationEditAction(): Promise<AuthActionState> {
  const user = await requireUser("/login?redirectTo=/verify-traveler");
  const supabase = await createClient();

  const { data: row, error: fetchError } = await supabase
    .from("traveler_verifications")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !row) {
    return { error: "Verification record not found." };
  }

  const status = row.status as string;
  if (
    status !== "pending" &&
    status !== "verified" &&
    status !== "invalid"
  ) {
    return { success: "You can already edit your documents below." };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("traveler_verifications")
      .update({
        status: "not_submitted",
        rejection_reason: null,
        reviewed_by: null,
        reviewed_at: null,
      })
      .eq("user_id", user.id);

    if (error) {
      return { error: mapAuthError(error.message) };
    }
  } catch {
    const { error } = await supabase
      .from("traveler_verifications")
      .update({
        status: "not_submitted",
        rejection_reason: null,
        reviewed_by: null,
        reviewed_at: null,
      })
      .eq("user_id", user.id);

    if (error) {
      return { error: mapAuthError(error.message) };
    }
  }

  revalidateVerificationSurfaces();

  return {
    success:
      "You can now update your documents. Submit again when everything is ready.",
  };
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

  revalidateVerificationSurfaces();

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

  const { data: row, error: fetchError } = await supabase
    .from("traveler_verifications")
    .select("*")
    .eq("id", verificationId)
    .maybeSingle();

  if (fetchError || !row) {
    return { error: "Verification record not found." };
  }

  const { checkTravelerVerificationIntegrity } = await import(
    "@/lib/verification/integrity"
  );
  const integrity = await checkTravelerVerificationIntegrity(
    row.user_id as string,
    { repair: false, row: row as import("@/types/traveler-verification").TravelerVerificationRow, log: true }
  );

  if (!integrity.allPathsPresent || !integrity.allFilesExist) {
    return {
      error:
        "Cannot approve: passport, selfie, and ticket must exist in storage.",
    };
  }

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

  revalidateVerificationSurfaces();
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

  revalidateVerificationSurfaces();
  return { success: "Verification rejected." };
}

export async function getVerificationSignedUrlAction(
  storagePath: string
): Promise<{ url: string | null; error?: string }> {
  const user = await requireUser();
  const supabase = await createClient();

  const folder = verificationFolderFromPath(storagePath);
  if (!userOwnsVerificationFolder(folder, user.id)) {
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
