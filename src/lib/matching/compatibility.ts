import {
  DEFAULT_AGREED_PRICE_EGP,
  MIN_COMPATIBILITY_SCORE,
} from "@/lib/matching/constants";
import type {
  CompatibilityFactor,
  CompatibilityResult,
} from "@/types/match";

export type ListingForMatch = {
  id: string;
  traveler_id: string;
  origin_city: string;
  origin_country_code: string;
  destination_city: string;
  destination_country_code: string;
  departure_at: string | null;
  arrival_at: string;
  available_weight_kg: number;
  accepted_categories: string[];
  status: string;
};

export type RequestForMatch = {
  id: string;
  customer_id: string;
  item_category: string;
  estimated_weight_kg: number | null;
  max_budget: number | null;
  currency: string;
  preferred_origin_country_code: string | null;
  preferred_origin_city: string | null;
  needed_by: string | null;
  status: string;
  lifecycle_status: string;
};

function scoreRoute(
  listing: ListingForMatch,
  request: RequestForMatch
): CompatibilityFactor {
  const max = 25;
  let score = 0;
  const details: string[] = [];

  if (listing.destination_country_code.toUpperCase() === "EG") {
    score += 15;
    details.push("Trip ends in Egypt");
  } else {
    details.push("Listing destination is not Egypt");
  }

  const prefCountry = request.preferred_origin_country_code?.toUpperCase();
  if (!prefCountry) {
    score += 10;
    details.push("Any origin country OK");
  } else if (listing.origin_country_code.toUpperCase() === prefCountry) {
    score += 10;
    details.push(`Origin matches ${prefCountry}`);
  } else {
    details.push(`Prefers origin ${prefCountry}, trip from ${listing.origin_country_code}`);
  }

  const prefCity = request.preferred_origin_city?.trim().toLowerCase();
  if (prefCity && !listing.origin_city.toLowerCase().includes(prefCity)) {
    score = Math.max(0, score - 5);
    details.push("Preferred city may not match departure city");
  }

  return {
    key: "route",
    label: "Route",
    score,
    maxScore: max,
    passed: score >= max * 0.6,
    detail: details.join(" · "),
  };
}

function scoreDates(
  listing: ListingForMatch,
  request: RequestForMatch
): CompatibilityFactor {
  const max = 25;
  let score = max;
  const details: string[] = [];
  const arrival = new Date(listing.arrival_at);

  if (request.needed_by) {
    const needed = new Date(`${request.needed_by}T23:59:59.000Z`);
    if (arrival <= needed) {
      details.push("Traveler arrives before needed-by date");
    } else {
      score = 5;
      details.push("Arrival is after needed-by date");
    }
  } else {
    details.push("No needed-by date on request");
  }

  if (listing.departure_at) {
    const departure = new Date(listing.departure_at);
    if (departure <= arrival) {
      details.push("Departure before arrival");
    } else {
      score = Math.min(score, 8);
      details.push("Departure after arrival");
    }
  }

  return {
    key: "dates",
    label: "Dates",
    score,
    maxScore: max,
    passed: score >= max * 0.6,
    detail: details.join(" · "),
  };
}

function scoreCategory(
  listing: ListingForMatch,
  request: RequestForMatch
): CompatibilityFactor {
  const max = 25;
  const ok = listing.accepted_categories.includes(request.item_category);
  return {
    key: "category",
    label: "Category",
    score: ok ? max : 0,
    maxScore: max,
    passed: ok,
    detail: ok
      ? `${request.item_category} is allowed on this trip`
      : `Traveler does not carry ${request.item_category}`,
  };
}

function scoreCapacity(
  listing: ListingForMatch,
  request: RequestForMatch
): CompatibilityFactor {
  const max = 15;
  if (request.estimated_weight_kg == null) {
    return {
      key: "capacity",
      label: "Capacity",
      score: max,
      maxScore: max,
      passed: true,
      detail: "Weight not specified on request",
    };
  }
  const ok = listing.available_weight_kg >= request.estimated_weight_kg;
  return {
    key: "capacity",
    label: "Capacity",
    score: ok ? max : 0,
    maxScore: max,
    passed: ok,
    detail: ok
      ? `${request.estimated_weight_kg} kg fits in ${listing.available_weight_kg} kg available`
      : `Need ${request.estimated_weight_kg} kg but only ${listing.available_weight_kg} kg available`,
  };
}

function scoreVerification(travelerVerified: boolean): CompatibilityFactor {
  const max = 10;
  return {
    key: "verification",
    label: "Verification",
    score: travelerVerified ? max : 3,
    maxScore: max,
    passed: travelerVerified,
    detail: travelerVerified
      ? "Traveler has approved ID verification"
      : "Traveler is not ID-verified yet",
  };
}

export function computeCompatibility(
  listing: ListingForMatch,
  request: RequestForMatch,
  travelerVerified: boolean
): CompatibilityResult {
  const factors = [
    scoreRoute(listing, request),
    scoreDates(listing, request),
    scoreCategory(listing, request),
    scoreCapacity(listing, request),
    scoreVerification(travelerVerified),
  ];

  const score = factors.reduce((sum, f) => sum + f.score, 0);

  return {
    score,
    factors,
    canMatch: score >= MIN_COMPATIBILITY_SCORE,
  };
}

export function resolveAgreedPrice(
  request: RequestForMatch,
  override?: number
): number {
  if (override != null && override > 0) return override;
  if (request.max_budget != null && request.max_budget > 0) {
    return request.max_budget;
  }
  return DEFAULT_AGREED_PRICE_EGP;
}
