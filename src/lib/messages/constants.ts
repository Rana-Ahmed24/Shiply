export const CHAT_IMAGES_BUCKET =
  process.env.NEXT_PUBLIC_CHAT_IMAGES_BUCKET ?? "chat-images";

export const MAX_CHAT_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_CHAT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

/** Match statuses that allow messaging */
export const CHAT_ELIGIBLE_STATUSES = [
  "accepted",
  "deposit_pending",
  "deposit_held",
  "in_transit",
  "delivered",
  "completed",
] as const;

export const TYPING_BROADCAST_EVENT = "typing";

export const TYPING_TIMEOUT_MS = 3000;
