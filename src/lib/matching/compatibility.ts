import { countryName } from "@/lib/listings/constants";
import { DEFAULT_AGREED_PRICE_EGP } from "@/lib/matching/constants";
import type {
  CompatibilityFactor,
  CompatibilityResult,
} from "@/types/match";

function formatFriendlyDate(iso: string): string {
  const normalized = iso.includes("T") ? iso : `${iso}T12:00:00.000Z`;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(normalized));
}

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

  const destCountry = countryName(listing.destination_country_code);
  const originCountry = countryName(listing.origin_country_code);
  const destCity = listing.destination_city;

  if (listing.destination_country_code.toUpperCase() === "EG") {
    score += 15;
    details.push(
      `This trip ends in ${destCity}, ${destCountry} — suitable for delivery into Egypt.`
    );
  } else {
    details.push(
      `This trip ends in ${destCity}, ${destCountry}, not Egypt — it may not work for delivery into Egypt.`
    );
  }

  const prefCountryCode = request.preferred_origin_country_code?.toUpperCase();
  if (!prefCountryCode) {
    score += 10;
    details.push(
      "You did not specify where the item should be bought from; any departure country is acceptable."
    );
  } else if (listing.origin_country_code.toUpperCase() === prefCountryCode) {
    score += 10;
    const prefCountry = countryName(prefCountryCode);
    details.push(
      `You want the item from ${prefCountry}. Traveler departs from ${listing.origin_city}, ${originCountry} — that matches.`
    );
  } else {
    const prefCountry = countryName(prefCountryCode);
    details.push(
      `You want the item from ${prefCountry}, but this traveler departs from ${listing.origin_city}, ${originCountry}.`
    );
  }

  const prefCity = request.preferred_origin_city?.trim();
  if (prefCity) {
    const cityMatches = listing.origin_city
      .toLowerCase()
      .includes(prefCity.toLowerCase());
    if (cityMatches) {
      details.push(
        `You asked for a departure city near ${prefCity}; this trip leaves from ${listing.origin_city}.`
      );
    } else {
      score = Math.max(0, score - 5);
      details.push(
        `You asked for a departure city near ${prefCity}; this trip leaves from ${listing.origin_city} instead.`
      );
    }
  }

  return {
    key: "route",
    label: "Route & locations",
    score,
    maxScore: max,
    passed: score >= max * 0.6,
    detail: details.join(" "),
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
  const arrivalLabel = formatFriendlyDate(listing.arrival_at);

  if (request.needed_by) {
    const needed = new Date(`${request.needed_by}T23:59:59.000Z`);
    const neededLabel = formatFriendlyDate(request.needed_by);
    if (arrival <= needed) {
      details.push(
        `You need the item by ${neededLabel}. Traveler will arrive in Egypt on ${arrivalLabel} — in time for your deadline.`
      );
    } else {
      score = 5;
      details.push(
        `You need the item by ${neededLabel}, but the traveler will only arrive on ${arrivalLabel} — after your deadline.`
      );
    }
  } else {
    details.push(
      `You did not set a needed-by date. Traveler will arrive in Egypt on ${arrivalLabel}.`
    );
  }

  if (listing.departure_at) {
    const departure = new Date(listing.departure_at);
    const departureLabel = formatFriendlyDate(listing.departure_at);
    if (departure <= arrival) {
      details.push(
        `Traveler leaves on ${departureLabel} and arrives on ${arrivalLabel}.`
      );
    } else {
      score = Math.min(score, 8);
      details.push(
        `Trip dates look unusual: departure (${departureLabel}) is after arrival (${arrivalLabel}).`
      );
    }
  }

  return {
    key: "dates",
    label: "Dates & timing",
    score,
    maxScore: max,
    passed: score >= max * 0.6,
    detail: details.join(" "),
  };
}

function scoreCategory(
  listing: ListingForMatch,
  request: RequestForMatch
): CompatibilityFactor {
  const max = 25;
  const ok = listing.accepted_categories.includes(request.item_category);
  const allowed = listing.accepted_categories.join(", ");
  const wanted = request.item_category;

  return {
    key: "category",
    label: "Product category",
    score: ok ? max : 0,
    maxScore: max,
    passed: ok,
    detail: ok
      ? `You want ${wanted}. This traveler accepts: ${allowed} — your item type is included.`
      : `You want ${wanted}. This traveler only accepts: ${allowed} — your item type is not on their list.`,
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
      label: "Weight & capacity",
      score: max,
      maxScore: max,
      passed: true,
      detail: `You did not estimate package weight. Traveler has ${listing.available_weight_kg} kg free on this trip.`,
    };
  }
  const ok = listing.available_weight_kg >= request.estimated_weight_kg;
  return {
    key: "capacity",
    label: "Weight & capacity",
    score: ok ? max : 0,
    maxScore: max,
    passed: ok,
    detail: ok
      ? `Your package is about ${request.estimated_weight_kg} kg. Traveler has ${listing.available_weight_kg} kg free capacity — enough room.`
      : `Your package is about ${request.estimated_weight_kg} kg, but traveler only has ${listing.available_weight_kg} kg free on this trip.`,
  };
}

function scoreVerification(travelerVerified: boolean): CompatibilityFactor {
  const max = 10;
  return {
    key: "verification",
    label: "Traveler verification",
    score: travelerVerified ? max : 3,
    maxScore: max,
    passed: travelerVerified,
    detail: travelerVerified
      ? "This traveler is a verified traveler on Shiply (passport, selfie, and flight proof reviewed)."
      : "This traveler has not completed Shiply verification yet. You can still send a request.",
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
    canMatch: true,
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
