export type AppMode = "customer" | "traveler";

export const MODE_COOKIE = "shiply_mode";

export const MODE_LABELS: Record<AppMode, string> = {
  customer: "Customer Mode",
  traveler: "Traveler Mode",
};

export const MODE_SHORT: Record<AppMode, string> = {
  customer: "Customer",
  traveler: "Traveler",
};

export function defaultFeedTab(mode: AppMode): "travelers" | "requests" {
  return mode === "customer" ? "travelers" : "requests";
}
