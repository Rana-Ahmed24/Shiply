import { isDateBeforeToday } from "@/lib/format/date";
import { LISTING_CATEGORIES } from "@/lib/listings/constants";
import { pickOriginCityForCountry } from "@/lib/geo/cities-by-country";
import type { ListingDetail } from "@/types/listing";

export type ListingFormValues = {
  originCountryCode: string;
  originCity: string;
  destinationCity: string;
  departureDate: string;
  arrivalDate: string;
  availableWeightKg: string;
  serviceType: string;
  notes: string;
  publish: string;
  categories: string[];
  deliveryPreferences: string[];
};

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function initialListingFormValues(
  listing?: ListingDetail
): ListingFormValues {
  const originCountryCode = listing?.originCountryCode ?? "US";
  return {
    originCountryCode,
    originCity:
      listing?.origin.city ??
      pickOriginCityForCountry(originCountryCode, ""),
    destinationCity: listing?.destination.city ?? "Cairo",
    departureDate: toDateInput(listing?.departureAt ?? null),
    arrivalDate: toDateInput(listing?.arrivalAt ?? null),
    availableWeightKg:
      listing?.availableWeightKg != null
        ? String(listing.availableWeightKg)
        : "5",
    serviceType: listing?.serviceType ?? "both",
    notes: listing?.notes ?? "",
    publish: listing?.status === "draft" ? "draft" : "active",
    categories: listing?.categories?.length
      ? [...listing.categories]
      : [LISTING_CATEGORIES[0]],
    deliveryPreferences: listing?.deliveryPreferences
      ? [...listing.deliveryPreferences]
      : [],
  };
}

export function isListingFormValuesComplete(
  values: ListingFormValues
): boolean {
  const originCity = values.originCity.trim();

  if (!values.originCountryCode) return false;
  if (!originCity || originCity.length < 2) return false;
  if (!values.destinationCity) return false;
  if (!values.arrivalDate) return false;
  if (isDateBeforeToday(values.arrivalDate)) return false;
  if (values.departureDate && isDateBeforeToday(values.departureDate)) {
    return false;
  }

  const weight = values.availableWeightKg.trim();
  if (!weight || Number(weight) <= 0) return false;

  if (values.categories.length === 0) return false;

  if (
    values.departureDate &&
    values.arrivalDate &&
    new Date(values.arrivalDate) < new Date(values.departureDate)
  ) {
    return false;
  }

  return true;
}
