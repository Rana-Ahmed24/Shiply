/** Stable short date for SSR + client (avoids locale/timezone hydration drift). */
export function formatShortDateUtc(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
