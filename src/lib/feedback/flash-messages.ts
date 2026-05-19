export type FlashMessageKey =
  | "listing_deleted"
  | "request_deleted"
  | "request_cancelled"
  | "profile_updated"
  | "password_updated"
  | "email_confirmed"
  | "match_requested"
  | "match_accepted"
  | "match_rejected"
  | "match_completed";

export type FlashMessageConfig = {
  title: string;
  description: string;
  confirmLabel: string;
  /** Path to navigate to when dismissed (query params stripped) */
  dismissPath: string;
};

export const FLASH_MESSAGES: Record<FlashMessageKey, FlashMessageConfig> = {
  listing_deleted: {
    title: "Listing deleted",
    description:
      "Your traveler listing was removed. You can post a new trip anytime from home.",
    confirmLabel: "Back to home",
    dismissPath: "/home",
  },
  request_deleted: {
    title: "Request deleted",
    description: "Your customer request was removed from the marketplace.",
    confirmLabel: "Back to my requests",
    dismissPath: "/requests",
  },
  request_cancelled: {
    title: "Request cancelled",
    description: "Your request is no longer visible to travelers.",
    confirmLabel: "Back to my requests",
    dismissPath: "/requests",
  },
  profile_updated: {
    title: "Profile updated",
    description:
      "Your profile has been updated. Your name, bio, and preferences are saved.",
    confirmLabel: "Back to home",
    dismissPath: "/home",
  },
  password_updated: {
    title: "Password updated",
    description: "Your password was changed. You can sign in with your new password.",
    confirmLabel: "Continue to sign in",
    dismissPath: "/login",
  },
  email_confirmed: {
    title: "Email confirmed",
    description: "Your email address is verified. You can sign in now.",
    confirmLabel: "Continue to sign in",
    dismissPath: "/login",
  },
  match_requested: {
    title: "Match requested",
    description:
      "Your delivery match was sent. The other party will be notified to accept or decline.",
    confirmLabel: "View match",
    dismissPath: "/matches",
  },
  match_accepted: {
    title: "Match accepted",
    description: "You agreed to this delivery. You can message and arrange deposit next.",
    confirmLabel: "View match",
    dismissPath: "/matches",
  },
  match_rejected: {
    title: "Match declined",
    description: "This delivery match was declined.",
    confirmLabel: "Back to matches",
    dismissPath: "/matches",
  },
  match_completed: {
    title: "Delivery completed",
    description: "This match is marked complete. Thanks for using Shiply Egypt.",
    confirmLabel: "View matches",
    dismissPath: "/matches",
  },
};

export function getFlashMessage(
  key: string | undefined
): FlashMessageConfig | null {
  if (!key || !(key in FLASH_MESSAGES)) return null;
  return FLASH_MESSAGES[key as FlashMessageKey];
}
