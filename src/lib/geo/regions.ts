import { countryFlagEmoji } from "@/lib/geo/countries";

/** Egypt governorate / major destination cities (27) */
export const EGYPT_CITIES = [
  "Alexandria",
  "Arish",
  "Aswan",
  "Asyut",
  "Banha",
  "Beni Suef",
  "Cairo",
  "Damanhur",
  "Damietta",
  "Fayoum",
  "Giza",
  "Hurghada",
  "Ismailia",
  "Kafr El Sheikh",
  "Kharga",
  "Luxor",
  "Mansoura",
  "Matrouh",
  "Minya",
  "Port Said",
  "Qena",
  "Sharm El Sheikh",
  "Sohag",
  "Suez",
  "Tanta",
  "Zagazig",
  "6th of October",
] as const;

/** Cities available per country code for filters (extend as needed). */
export const CITIES_BY_COUNTRY: Record<string, readonly string[]> = {
  EG: EGYPT_CITIES,
  US: [
    "Atlanta",
    "Boston",
    "Chicago",
    "Dallas",
    "Houston",
    "Los Angeles",
    "Miami",
    "New York",
    "San Francisco",
    "Seattle",
    "Washington",
  ],
  GB: ["Birmingham", "Edinburgh", "London", "Manchester"],
  AE: ["Abu Dhabi", "Dubai", "Sharjah"],
  SA: ["Jeddah", "Riyadh", "Dammam"],
  FR: ["Lyon", "Marseille", "Paris"],
  DE: ["Berlin", "Frankfurt", "Munich"],
  IT: ["Milan", "Rome"],
  TR: ["Ankara", "Istanbul"],
  QA: ["Doha"],
  KW: ["Kuwait City"],
  OM: ["Muscat"],
  BH: ["Manama"],
  JO: ["Amman"],
  LB: ["Beirut"],
  IN: ["Delhi", "Mumbai"],
  CN: ["Beijing", "Hong Kong", "Shanghai"],
  JP: ["Tokyo"],
  SG: ["Singapore"],
  CA: ["Montreal", "Toronto", "Vancouver"],
  AU: ["Melbourne", "Sydney"],
};

export function filterByPrefix<T extends string>(
  items: readonly T[],
  query: string
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...items];
  return items.filter((item) => item.toLowerCase().startsWith(q));
}

export function getCitiesForCountry(countryCode: string): readonly string[] {
  const code = countryCode.toUpperCase();
  if (code === "EG") return EGYPT_CITIES;
  return CITIES_BY_COUNTRY[code] ?? [];
}

export type CountryFilterOption = {
  code: string;
  name: string;
  flag: string;
};

export function filterCountries(
  countries: readonly CountryFilterOption[],
  query: string
): CountryFilterOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...countries];
  return countries.filter(
    (c) =>
      c.name.toLowerCase().startsWith(q) ||
      c.code.toLowerCase().startsWith(q)
  );
}
