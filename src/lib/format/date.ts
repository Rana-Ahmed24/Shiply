/** Local calendar date (YYYY-MM-DD) in the user's timezone. */
export function localDateIso(): string {
  return new Date().toLocaleDateString("en-CA");
}

/** Latest of today and optional ISO date strings (for chained min dates). */
export function minSelectableDateIso(...dates: (string | undefined)[]): string {
  const candidates = [localDateIso(), ...dates.filter((d): d is string => Boolean(d))];
  return candidates.reduce((max, d) => (d > max ? d : max));
}

export function isDateBeforeToday(iso: string): boolean {
  return iso < localDateIso();
}

/** Stable short date for SSR + client (avoids locale/timezone hydration drift). */
export function formatShortDateUtc(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
