export const LISTING_PAGE_SIZE = 12;

export const LISTING_SORT_OPTIONS = [
  { value: "arrival_asc", label: "Arriving soonest" },
  { value: "arrival_desc", label: "Arriving latest" },
  { value: "capacity_desc", label: "Most capacity" },
  { value: "newest", label: "Newest" },
] as const;

export type ListingSort = (typeof LISTING_SORT_OPTIONS)[number]["value"];

export const LISTING_CATEGORIES = [
  "Electronics",
  "Phones",
  "Laptops",
  "Clothes",
  "Cosmetics",
  "Supplements",
  "Accessories",
  "Documents",
  "Gifts",
  "Other",
] as const;

export const DELIVERY_PREFERENCES = [
  "Airport meetup",
  "City center meetup",
  "Hotel delivery",
  "Home delivery",
  "Flexible schedule",
  "Receipt required",
] as const;

export const SERVICE_TYPE_OPTIONS = [
  { value: "both", label: "Shop & ship + ship only" },
  { value: "shop_and_ship", label: "Shop & ship" },
  { value: "ship_only", label: "Ship only" },
] as const;

import { countryFlagEmoji, WORLD_COUNTRIES } from "@/lib/geo/countries";
import { EGYPT_ARRIVAL_CITIES } from "@/lib/geo/cities";

/** All supported countries, sorted A–Z */
export const DEPARTURE_COUNTRIES = WORLD_COUNTRIES;

export const ARRIVAL_CITIES = EGYPT_ARRIVAL_CITIES;

export function countryFlag(code: string): string {
  return countryFlagEmoji(code);
}

export function countryName(code: string): string {
  return (
    DEPARTURE_COUNTRIES.find((c) => c.code === code.toUpperCase())?.name ??
    code.toUpperCase()
  );
}
