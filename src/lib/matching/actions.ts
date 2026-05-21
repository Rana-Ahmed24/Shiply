"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { mapAuthError, type AuthActionState } from "@/lib/auth/errors";
import { requireUser } from "@/lib/auth/server";
import {
  computeCompatibility,
  resolveAgreedPrice,
} from "@/lib/matching/compatibility";
import { PLATFORM_FEE_RATE } from "@/lib/matching/constants";
import { insertMatch, updateMatchById } from "@/lib/matching/db";
import { seedMatchChatWelcome } from "@/lib/matching/chat";
import { notifyMatchUpdate } from "@/lib/matching/notifications";
import {
  fetchListingForMatch,
  fetchRequestForMatch,
  getMatchByRequestId,
} from "@/lib/matching/queries";
import { createClient } from "@/lib/supabase/server";

function feeFromPrice(price: number): number {
  return Math.round(price * PLATFORM_FEE_RATE * 100) / 100;
}

function returnPath(formData: FormData, fallback: string): string {
  const raw = String(formData.get("returnTo") ?? "").trim();
  if (raw.startsWith("/") && !raw.startsWith("//")) {
    return raw.split("?")[0] ?? fallback;
  }
  return fallback;
}

function redirectWithToast(path: string, toast: string) {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}toast=${toast}`);
}

function matchesListPath(formData: FormData): string {
  const tab = String(formData.get("returnTab") ?? "sent");
  return tab === "incoming" ? "/matches?tab=incoming" : "/matches?tab=sent";
}

async function loadPair(listingId: string, requestId: string) {
  const [listing, request] = await Promise.all([
    fetchListingForMatch(listingId),
    fetchRequestForMatch(requestId),
  ]);
  return { listing, request };
}

export async function createMatchAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const user = await requireUser();
  const listingId = String(formData.get("listingId") ?? "");
  const requestId = String(formData.get("requestId") ?? "");
  const role = String(formData.get("role") ?? "customer");

  if (!listingId || !requestId) {
    return { error: "Listing and request are required." };
  }

  const { listing, request } = await loadPair(listingId, requestId);
  if (!listing || !request) {
    return { error: "Listing or request not found." };
  }

  if (listing.status !== "active") {
    return { error: "This trip is not available for matching." };
  }

  if (request.status !== "open" || request.lifecycle_status !== "pending") {
    return { error: "This request is not open for matching." };
  }

  if (listing.traveler_id === request.customer_id) {
    return { error: "You cannot match your own listing with your own request." };
  }

  const isCustomerRole = role === "customer";
  if (isCustomerRole && listing.traveler_id === user.id) {
    return { error: "You cannot send a request to your own trip." };
  }
  if (!isCustomerRole && request.customer_id === user.id) {
    return { error: "You cannot accept your own request." };
  }

  const existing = await getMatchByRequestId(requestId);
  if (existing && existing.status !== "cancelled") {
    return { error: "This request already has an active delivery match." };
  }

  const supabase = await createClient();
  const { data: verifications } = await supabase
    .from("verifications")
    .select("user_id")
    .eq("user_id", listing.traveler_id)
    .eq("status", "approved")
    .in("type", ["passport", "government_id", "flight_itinerary"])
    .limit(1);

  const verified = (verifications?.length ?? 0) > 0;
  const compatibility = computeCompatibility(listing, request, verified);

  const isCustomer = isCustomerRole;
  if (isCustomer && request.customer_id !== user.id) {
    return { error: "You can only request a match for your own requests." };
  }
  if (!isCustomer && listing.traveler_id !== user.id) {
    return { error: "You can only offer your own trips for this request." };
  }

  const agreedPrice = resolveAgreedPrice(
    request,
    Number(formData.get("agreedPrice")) || undefined
  );

  const { data: match, error } = await insertMatch(supabase, {
    listing_id: listingId,
    request_id: requestId,
    traveler_id: listing.traveler_id,
    customer_id: request.customer_id,
    agreed_price: agreedPrice,
    currency: request.currency || "EGP",
    platform_fee_amount: feeFromPrice(agreedPrice),
    initiated_by: user.id,
    compatibility_score: compatibility.score,
    compatibility_factors: compatibility.factors,
  });

  if (error || !match) {
    return { error: mapAuthError(error ?? "Could not create match.") };
  }

  const notifyUserId = isCustomer ? listing.traveler_id : request.customer_id;
  await notifyMatchUpdate({
    userId: notifyUserId,
    title: isCustomer ? "New delivery request" : "Traveler offered to deliver",
    body: isCustomer
      ? "A customer requested your trip for their package."
      : "A traveler offered to carry your request on their trip.",
    matchId: match.id,
  });

  revalidatePath("/");
  revalidatePath("/home");
  revalidatePath("/matches");
  revalidatePath(`/listings/${listingId}`);
  revalidatePath(`/requests/${requestId}`);

  const dest = returnPath(formData, "/");
  if (dest === "/" || dest === "/home") {
    redirectWithToast("/?toast=match_sent", "match_sent");
  }
  redirect(`/matches/${match.id}?message=match_requested`);
}

export async function acceptMatchAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const user = await requireUser();
  const matchId = String(formData.get("matchId") ?? "");

  const supabase = await createClient();
  const { data: match, error: fetchError } = await supabase
    .from("delivery_matches")
    .select(
      "id, status, initiated_by, traveler_id, customer_id, request_id, listing_id"
    )
    .eq("id", matchId)
    .maybeSingle();

  if (fetchError || !match) {
    return { error: "Match not found." };
  }

  if (match.traveler_id !== user.id && match.customer_id !== user.id) {
    return { error: "You are not part of this match." };
  }

  if (match.status !== "pending") {
    return { error: "This match is no longer pending." };
  }

  if (match.initiated_by === user.id) {
    return { error: "Wait for the other party to accept your request." };
  }

  const { error: updateError } = await updateMatchById(supabase, matchId, {
    status: "accepted",
    accepted_at: new Date().toISOString(),
  });

  if (updateError) {
    return { error: mapAuthError(updateError) };
  }

  await supabase
    .from("customer_requests")
    .update({ status: "matched", lifecycle_status: "accepted" })
    .eq("id", match.request_id);

  await seedMatchChatWelcome(matchId, user.id);

  await notifyMatchUpdate({
    userId: match.initiated_by,
    title: "Request accepted",
    body: "Your delivery request was accepted. Open Matches to view details and chat.",
    matchId,
    extra: { status: "accepted" },
  });

  revalidatePath("/");
  revalidatePath("/home");
  revalidatePath("/matches");
  revalidatePath(`/matches/${matchId}`);
  revalidatePath(`/messages/${matchId}`);

  const dest = returnPath(formData, "/matches");
  if (dest === "/" || dest === "/home") {
    redirectWithToast("/?toast=match_accepted", "match_accepted");
  }
  if (dest === "/matches") {
    redirectWithToast("/matches?tab=accepted", "match_accepted");
  }
  redirect(`/matches/${matchId}?message=match_accepted`);
}

export async function rejectMatchAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const user = await requireUser();
  const matchId = String(formData.get("matchId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim() || "Declined";

  const supabase = await createClient();
  const { data: match, error: fetchError } = await supabase
    .from("delivery_matches")
    .select(
      "id, status, initiated_by, traveler_id, customer_id, request_id"
    )
    .eq("id", matchId)
    .maybeSingle();

  if (fetchError || !match) {
    return { error: "Match not found." };
  }

  if (match.traveler_id !== user.id && match.customer_id !== user.id) {
    return { error: "You are not part of this match." };
  }

  if (match.status !== "pending") {
    return { error: "Only pending matches can be declined." };
  }

  const { error: updateError } = await updateMatchById(supabase, matchId, {
    status: "cancelled",
    cancelled_at: new Date().toISOString(),
    cancellation_reason: reason,
  });

  if (updateError) {
    return { error: mapAuthError(updateError) };
  }

  const otherParty =
    match.initiated_by === match.traveler_id
      ? match.customer_id
      : match.traveler_id;

  await notifyMatchUpdate({
    userId: otherParty,
    title: "Match declined",
    body: reason,
    matchId,
  });

  revalidatePath("/");
  revalidatePath("/home");
  revalidatePath("/matches");

  const dest = returnPath(formData, "/matches");
  if (dest === "/" || dest === "/home") {
    redirectWithToast("/?toast=match_rejected", "match_rejected");
  }
  if (dest === "/matches") {
    redirectWithToast(matchesListPath(formData), "match_rejected");
  }
  redirect("/matches?message=match_rejected");
}

export async function cancelMatchAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const user = await requireUser();
  const matchId = String(formData.get("matchId") ?? "");

  const supabase = await createClient();
  const { data: match, error: fetchError } = await supabase
    .from("delivery_matches")
    .select(
      "id, status, initiated_by, traveler_id, customer_id, request_id"
    )
    .eq("id", matchId)
    .maybeSingle();

  if (fetchError || !match) {
    return { error: "Match not found." };
  }

  if (match.customer_id !== user.id) {
    return { error: "Only the customer can cancel this request." };
  }

  if (match.initiated_by !== user.id) {
    return { error: "You can only cancel requests you sent." };
  }

  if (match.status !== "pending") {
    return { error: "Only pending requests can be cancelled." };
  }

  const { error: updateError } = await updateMatchById(supabase, matchId, {
    status: "cancelled",
    cancelled_at: new Date().toISOString(),
    cancellation_reason: "Cancelled by customer",
  });

  if (updateError) {
    return { error: mapAuthError(updateError) };
  }

  await notifyMatchUpdate({
    userId: match.traveler_id,
    title: "Request cancelled",
    body: "The customer cancelled their delivery request.",
    matchId,
  });

  revalidatePath("/");
  revalidatePath("/home");
  revalidatePath("/matches");

  const dest = returnPath(formData, "/matches");
  if (dest === "/" || dest === "/home") {
    redirectWithToast("/?toast=match_cancelled", "match_cancelled");
  }
  if (dest === "/matches") {
    redirectWithToast(matchesListPath(formData), "match_cancelled");
  }
  redirect("/matches?tab=sent&message=match_rejected");
}

export async function completeMatchAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const user = await requireUser();
  const matchId = String(formData.get("matchId") ?? "");

  const supabase = await createClient();
  const { data: match, error: fetchError } = await supabase
    .from("delivery_matches")
    .select(
      "id, status, initiated_by, traveler_id, customer_id, request_id"
    )
    .eq("id", matchId)
    .maybeSingle();

  if (fetchError || !match) {
    return { error: "Match not found." };
  }

  if (match.traveler_id !== user.id && match.customer_id !== user.id) {
    return { error: "You are not part of this match." };
  }

  if (match.status !== "accepted") {
    return { error: "Only accepted matches can be marked completed." };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await updateMatchById(supabase, matchId, {
    status: "completed",
    completed_at: now,
  });

  if (updateError) {
    return { error: mapAuthError(updateError) };
  }

  await supabase
    .from("customer_requests")
    .update({
      status: "fulfilled",
      lifecycle_status: "delivered",
    })
    .eq("id", match.request_id);

  const otherParty =
    user.id === match.traveler_id ? match.customer_id : match.traveler_id;

  await notifyMatchUpdate({
    userId: otherParty,
    title: "Delivery completed",
    body: "Your delivery match was marked as completed.",
    matchId,
  });

  revalidatePath("/matches");
  redirect(`/matches/${matchId}?message=match_completed`);
}
