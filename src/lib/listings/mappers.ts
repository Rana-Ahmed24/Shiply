import { countryFlag, countryName } from "@/lib/listings/constants";
import type {
  ListingCardModel,
  ListingDetail,
  ListingTravelerSummary,
  ServiceType,
  TravelerListingRow,
} from "@/types/listing";

const SERVICE_LABELS: Record<ServiceType, string> = {
  both: "Shop & ship + ship only",
  shop_and_ship: "Shop & ship",
  ship_only: "Ship only",
};

function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

function rowToCard(
  row: TravelerListingRow,
  traveler?: ListingTravelerSummary | null,
  verified = false
): ListingCardModel {
  return {
    id: row.id,
    href: `/listings/${row.id}`,
    origin: {
      city: row.origin_city,
      country: countryName(row.origin_country_code),
      flag: countryFlag(row.origin_country_code),
    },
    destination: {
      city: row.destination_city,
      country: countryName(row.destination_country_code),
      flag: countryFlag(row.destination_country_code),
    },
    arrives: formatShortDate(row.arrival_at),
    departs: row.departure_at ? formatShortDate(row.departure_at) : null,
    capacity: `${row.available_weight_kg} kg`,
    service: SERVICE_LABELS[row.service_type],
    rating: traveler?.traveler_rating_avg ?? 0,
    verified,
    categories: row.accepted_categories,
    deliveryPreferences: row.delivery_preferences ?? [],
    notesPreview: row.notes
      ? row.notes.length > 120
        ? `${row.notes.slice(0, 120)}…`
        : row.notes
      : null,
    status: row.status,
    travelerId: row.traveler_id,
    travelerName: traveler?.full_name ?? null,
    travelerAvatarUrl: traveler?.avatar_url ?? null,
    reviewCount: traveler?.traveler_review_count ?? 0,
  };
}

export function mapListingToCard(
  row: TravelerListingRow,
  traveler?: ListingTravelerSummary | null,
  verified = false
): ListingCardModel {
  return rowToCard(row, traveler, verified);
}

export function mapListingToDetail(
  row: TravelerListingRow,
  traveler?: ListingTravelerSummary | null,
  verified = false
): ListingDetail {
  const card = rowToCard(row, traveler, verified);
  return {
    ...card,
    notes: row.notes,
    availableWeightKg: row.available_weight_kg,
    originCountryCode: row.origin_country_code,
    departureAt: row.departure_at,
    arrivalAt: row.arrival_at,
    serviceType: row.service_type,
    createdAt: row.created_at,
    traveler: traveler ?? null,
  };
}

export function mockListingToCard(
  listing: import("@/types/listing").TravelerListing & { id: string }
): ListingCardModel {
  return {
    ...listing,
    href: `/listings/${listing.id}`,
    departs: null,
    deliveryPreferences: [],
    notesPreview: null,
    status: "active",
    travelerId: "",
    travelerName: null,
  };
}
