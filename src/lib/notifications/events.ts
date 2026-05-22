import "server-only";

import { createNotification } from "@/lib/notifications/create";

export function notifyNewMatch(params: {
  recipientId: string;
  actorId: string;
  matchId: string;
  title: string;
  body: string;
}) {
  return createNotification({
    userId: params.recipientId,
    actorId: params.actorId,
    event: "new_match",
    title: params.title,
    body: params.body,
    linkUrl: `/matches/${params.matchId}`,
    metadata: { match_id: params.matchId },
  });
}

export function notifyMatchAccepted(params: {
  recipientId: string;
  actorId: string;
  matchId: string;
}) {
  return createNotification({
    userId: params.recipientId,
    actorId: params.actorId,
    event: "match_accepted",
    title: "Request accepted",
    body: "Your delivery request was accepted. Open the match to chat and arrange next steps.",
    linkUrl: `/matches/${params.matchId}`,
    metadata: { match_id: params.matchId },
  });
}

export function notifyMatchRejected(params: {
  recipientId: string;
  actorId: string;
  matchId: string;
  reason?: string;
}) {
  return createNotification({
    userId: params.recipientId,
    actorId: params.actorId,
    event: "match_rejected",
    title: "Match declined",
    body: params.reason ?? "The other party declined this delivery match.",
    linkUrl: `/matches/${params.matchId}`,
    metadata: { match_id: params.matchId },
  });
}

export function notifyMatchCancelled(params: {
  recipientId: string;
  actorId: string;
  matchId: string;
}) {
  return createNotification({
    userId: params.recipientId,
    actorId: params.actorId,
    event: "match_cancelled",
    title: "Request cancelled",
    body: "The customer cancelled their delivery request.",
    linkUrl: `/matches/${params.matchId}`,
    metadata: { match_id: params.matchId },
  });
}

export function notifyDeliveryCompleted(params: {
  recipientId: string;
  actorId: string;
  matchId: string;
}) {
  return createNotification({
    userId: params.recipientId,
    actorId: params.actorId,
    event: "delivery_completed",
    title: "Delivery completed",
    body: "Your delivery was marked complete. You can leave a review from the match page.",
    linkUrl: `/matches/${params.matchId}`,
    metadata: { match_id: params.matchId },
  });
}

export function notifyDepositPaid(params: {
  recipientId: string;
  actorId: string;
  matchId: string;
  amountLabel?: string;
}) {
  return createNotification({
    userId: params.recipientId,
    actorId: params.actorId,
    event: "deposit_paid",
    title: "Deposit paid",
    body: params.amountLabel
      ? `Escrow deposit of ${params.amountLabel} was recorded for your match.`
      : "An escrow deposit was recorded for your match.",
    linkUrl: `/matches/${params.matchId}`,
    metadata: { match_id: params.matchId },
  });
}

export function notifyPurchaseConfirmed(params: {
  recipientId: string;
  actorId: string;
  matchId: string;
  requestId?: string;
}) {
  return createNotification({
    userId: params.recipientId,
    actorId: params.actorId,
    event: "purchase_confirmed",
    title: "Purchase confirmed",
    body: "The traveler confirmed they purchased the items for your request.",
    linkUrl: params.matchId
      ? `/matches/${params.matchId}`
      : params.requestId
        ? `/requests/${params.requestId}`
        : "/matches",
    metadata: { match_id: params.matchId, request_id: params.requestId },
  });
}

export function notifyNewMessage(params: {
  recipientId: string;
  actorId: string;
  matchId: string;
  senderName: string;
  preview: string;
}) {
  return createNotification({
    userId: params.recipientId,
    actorId: params.actorId,
    event: "new_message",
    title: `Message from ${params.senderName}`,
    body: params.preview.slice(0, 120),
    linkUrl: `/messages/${params.matchId}`,
    metadata: { match_id: params.matchId },
    sendEmail: false,
  });
}

export function notifyReviewReceived(params: {
  recipientId: string;
  actorId: string;
  matchId: string;
  rating: number;
}) {
  return createNotification({
    userId: params.recipientId,
    actorId: params.actorId,
    event: "review_received",
    title: "New review",
    body: `You received a ${params.rating}-star review for a completed delivery.`,
    linkUrl: `/profile/${params.recipientId}`,
    metadata: { match_id: params.matchId, rating: params.rating },
    sendEmail: false,
  });
}

export function notifyVerificationApproved(params: {
  userId: string;
  actorId: string;
}) {
  return createNotification({
    userId: params.userId,
    actorId: params.actorId,
    event: "verification_approved",
    title: "Verification approved",
    body: "You are now a verified traveler. Your badge will appear on listings and matches.",
    linkUrl: "/verify-traveler",
    sendEmail: true,
  });
}

export function notifyVerificationRejected(params: {
  userId: string;
  actorId: string;
  reason?: string | null;
}) {
  return createNotification({
    userId: params.userId,
    actorId: params.actorId,
    event: "verification_rejected",
    title: "Verification rejected",
    body:
      params.reason?.trim() ||
      "Your verification was not approved. You can update documents and resubmit.",
    linkUrl: "/verify-traveler",
    sendEmail: true,
  });
}
