import { EGYPT_ARRIVAL_CITIES } from "@/lib/geo/cities";
import { CITIES_BY_COUNTRY } from "@/lib/geo/regions";

/** Maps preset departure cities to ISO country codes */
const CITY_TO_COUNTRY: Record<string, string> = {
  "Abu Dhabi": "AE",
  Amman: "JO",
  Amsterdam: "NL",
  Athens: "GR",
  Atlanta: "US",
  Baghdad: "IQ",
  Bangkok: "TH",
  Barcelona: "ES",
  Beijing: "CN",
  Berlin: "DE",
  Boston: "US",
  Brussels: "BE",
  Bucharest: "RO",
  Budapest: "HU",
  Cairo: "EG",
  Chicago: "US",
  Dallas: "US",
  Delhi: "IN",
  Doha: "QA",
  Dubai: "AE",
  Dublin: "IE",
  Frankfurt: "DE",
  Geneva: "CH",
  "Hong Kong": "HK",
  Houston: "US",
  Istanbul: "TR",
  Jakarta: "ID",
  Jeddah: "SA",
  Johannesburg: "ZA",
  "Kuala Lumpur": "MY",
  "Kuwait City": "KW",
  Lagos: "NG",
  Lisbon: "PT",
  London: "GB",
  "Los Angeles": "US",
  Madrid: "ES",
  Manila: "PH",
  Marseille: "FR",
  Melbourne: "AU",
  "Mexico City": "MX",
  Miami: "US",
  Milan: "IT",
  Montreal: "CA",
  Moscow: "RU",
  Mumbai: "IN",
  Munich: "DE",
  Muscat: "OM",
  Nairobi: "KE",
  "New York": "US",
  Paris: "FR",
  Prague: "CZ",
  Riyadh: "SA",
  Rome: "IT",
  "San Francisco": "US",
  Seattle: "US",
  Seoul: "KR",
  Shanghai: "CN",
  Singapore: "SG",
  Stockholm: "SE",
  Sydney: "AU",
  Tokyo: "JP",
  Toronto: "CA",
  Vienna: "AT",
  Warsaw: "PL",
  Washington: "US",
  Zurich: "CH",
};

function buildDepartureCitiesByCountry(): Record<string, string[]> {
  const byCountry = new Map<string, Set<string>>();

  function add(code: string, city: string) {
    const upper = code.toUpperCase();
    if (!byCountry.has(upper)) byCountry.set(upper, new Set());
    byCountry.get(upper)!.add(city);
  }

  for (const [city, code] of Object.entries(CITY_TO_COUNTRY)) {
    add(code, city);
  }

  for (const city of EGYPT_ARRIVAL_CITIES) {
    add("EG", city);
  }

  const result: Record<string, string[]> = {};
  for (const [code, cities] of byCountry) {
    result[code] = [...cities].sort((a, b) => a.localeCompare(b));
  }
  return result;
}

export const DEPARTURE_CITIES_BY_COUNTRY = buildDepartureCitiesByCountry();

export function getDepartureCitiesForCountry(countryCode: string): string[] {
  const code = countryCode.toUpperCase();
  const merged = new Set<string>([
    ...(DEPARTURE_CITIES_BY_COUNTRY[code] ?? []),
    ...(CITIES_BY_COUNTRY[code] ?? []),
  ]);
  return [...merged].sort((a, b) => a.localeCompare(b));
}

export function pickOriginCityForCountry(
  countryCode: string,
  currentCity: string
): string {
  const cities = getDepartureCitiesForCountry(countryCode);
  if (currentCity && cities.includes(currentCity)) return currentCity;
  if (cities.length > 0) return cities[0];
  return "";
}
