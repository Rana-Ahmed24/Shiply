"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  fieldErrorsFromZod,
  mapAuthError,
  type AuthActionState,
} from "@/lib/auth/errors";
import { requireAdmin } from "@/lib/auth/require-admin";
import { requireUser } from "@/lib/auth/server";
import { notifyReviewReceived } from "@/lib/notifications/events";
import { recalculateProfileRatings } from "@/lib/reviews/stats";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const submitSchema = z.object({
  matchId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export async function submitReviewAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const user = await requireUser();
  const parsed = submitSchema.safeParse({
    matchId: formData.get("matchId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const { matchId, rating, comment } = parsed.data;
  const supabase = await createClient();

  const { data: match, error: matchError } = await supabase
    .from("delivery_matches")
    .select("id, status, traveler_id, customer_id")
    .eq("id", matchId)
    .maybeSingle();

  if (matchError || !match) {
    return { error: "Match not found." };
  }

  if (match.status !== "completed") {
    return { error: "You can only review after the delivery is completed." };
  }

  const isTraveler = match.traveler_id === user.id;
  const isCustomer = match.customer_id === user.id;

  if (!isTraveler && !isCustomer) {
    return { error: "You are not part of this delivery." };
  }

  const revieweeId = isTraveler ? match.customer_id : match.traveler_id;

  if (revieweeId === user.id) {
    return { error: "You cannot review yourself." };
  }

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("match_id", matchId)
    .eq("reviewer_id", user.id)
    .maybeSingle();

  if (existing) {
    return { error: "You have already submitted a review for this delivery." };
  }

  const { error: insertError } = await supabase.from("reviews").insert({
    match_id: matchId,
    reviewer_id: user.id,
    reviewee_id: revieweeId,
    rating,
    comment,
    is_public: true,
    is_flagged: false,
  });

  if (insertError) {
    if (insertError.message.includes("reviews_one_per_reviewer_per_match")) {
      return { error: "You have already submitted a review for this delivery." };
    }
    return { error: mapAuthError(insertError.message) };
  }

  await recalculateProfileRatings(revieweeId);

  await notifyReviewReceived({
    recipientId: revieweeId,
    actorId: user.id,
    matchId,
    rating,
  });

  revalidatePath(`/matches/${matchId}`);
  revalidatePath(`/profile/${revieweeId}`);
  revalidatePath("/listings");
  revalidatePath("/matches");

  return { success: "Thank you — your review was submitted." };
}

type ModerationAction = "hide" | "show" | "flag" | "unflag" | "remove" | "restore";

const moderateSchema = z.object({
  reviewId: z.string().uuid(),
  action: z.enum(["hide", "show", "flag", "unflag", "remove", "restore"]),
});

export async function moderateReviewAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const session = await requireAdmin();
  const parsed = moderateSchema.safeParse({
    reviewId: formData.get("reviewId"),
    action: formData.get("action"),
  });

  if (!parsed.success) {
    return { error: "Invalid moderation request." };
  }

  const { reviewId, action } = parsed.data;

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Admin moderation requires SUPABASE_SERVICE_ROLE_KEY." };
  }

  const { data: review, error: fetchError } = await admin
    .from("reviews")
    .select("id, reviewee_id, is_public, is_flagged, removed_at")
    .eq("id", reviewId)
    .maybeSingle();

  if (fetchError || !review) {
    return { error: "Review not found." };
  }

  const updates: {
    is_public?: boolean;
    is_flagged?: boolean;
    removed_at?: string | null;
  } = {};

  switch (action as ModerationAction) {
    case "hide":
      updates.is_public = false;
      break;
    case "show":
      updates.is_public = true;
      updates.removed_at = null;
      break;
    case "flag":
      updates.is_flagged = true;
      break;
    case "unflag":
      updates.is_flagged = false;
      break;
    case "remove":
      updates.is_public = false;
      updates.removed_at = new Date().toISOString();
      break;
    case "restore":
      updates.is_public = true;
      updates.is_flagged = false;
      updates.removed_at = null;
      break;
    default:
      return { error: "Unknown action." };
  }

  const { error: updateError } = await admin
    .from("reviews")
    .update(updates)
    .eq("id", reviewId);

  if (updateError) {
    return { error: mapAuthError(updateError.message) };
  }

  const actionType =
    action === "remove" ? ("review_remove" as const) : ("note_added" as const);

  await admin.from("admin_actions").insert({
    admin_id: session.user.id,
    action_type: actionType,
    target_type: "review",
    target_id: reviewId,
    metadata: { moderation: action, reviewee_id: review.reviewee_id },
  } as never);

  await recalculateProfileRatings(review.reviewee_id as string);

  revalidatePath("/admin/reviews");
  revalidatePath(`/profile/${review.reviewee_id}`);

  return { success: "Review updated." };
}
