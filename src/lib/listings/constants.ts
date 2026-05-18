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

export const DEPARTURE_COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
] as const;

export const ARRIVAL_CITIES = [
  "Cairo",
  "Alexandria",
  "Giza",
  "Hurghada",
  "Sharm El Sheikh",
] as const;

export const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  GB: "🇬🇧",
  AE: "🇦🇪",
  SA: "🇸🇦",
  DE: "🇩🇪",
  FR: "🇫🇷",
  IT: "🇮🇹",
  TR: "🇹🇷",
  QA: "🇶🇦",
  KW: "🇰🇼",
  EG: "🇪🇬",
};

export function countryFlag(code: string): string {
  return COUNTRY_FLAGS[code.toUpperCase()] ?? "🌍";
}

export function countryName(code: string): string {
  return (
    DEPARTURE_COUNTRIES.find((c) => c.code === code.toUpperCase())?.name ??
    code.toUpperCase()
  );
}
