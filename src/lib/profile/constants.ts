export const TRAVELER_TIERS = ["bronze", "silver", "gold"] as const;

export type TravelerTier = (typeof TRAVELER_TIERS)[number];

export const TIER_THRESHOLDS = {
  silver: 10,
  gold: 50,
} as const;

export const TIER_LABELS: Record<TravelerTier, string> = {
  bronze: "Bronze Traveler",
  silver: "Silver Traveler",
  gold: "Gold Traveler",
};

export const TIER_DESCRIPTIONS: Record<TravelerTier, string> = {
  bronze: "Getting started on HitchHiker",
  silver: "Trusted traveler with a solid track record",
  gold: "Top-rated elite traveler",
};

export const LANGUAGE_OPTIONS = [
  "Arabic",
  "English",
  "French",
  "German",
  "Italian",
  "Spanish",
  "Turkish",
  "Other",
] as const;

export const MEETUP_LOCATION_SUGGESTIONS = [
  "Cairo International Airport (CAI)",
  "Cairo — Zamalek",
  "Cairo — New Cairo",
  "Alexandria",
  "Giza",
  "Hurghada Airport",
  "Sharm El Sheikh Airport",
] as const;

export const VERIFICATION_LABELS: Record<string, string> = {
  email: "Email verified",
  phone: "Phone verified",
  government_id: "ID verified",
  passport: "Passport verified",
  flight_itinerary: "Flight verified",
  selfie_liveness: "Selfie verified",
};
