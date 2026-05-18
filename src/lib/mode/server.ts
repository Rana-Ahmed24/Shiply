import "server-only";

import { cookies } from "next/headers";

import { MODE_COOKIE, type AppMode } from "@/lib/mode/constants";

export function parseAppMode(value: string | null | undefined): AppMode | null {
  if (value === "customer" || value === "traveler") return value;
  return null;
}

export async function getAppMode(
  profilePreferred?: AppMode | null
): Promise<AppMode> {
  const cookieStore = await cookies();
  const fromCookie = parseAppMode(cookieStore.get(MODE_COOKIE)?.value);
  if (fromCookie) return fromCookie;
  return profilePreferred ?? "customer";
}

