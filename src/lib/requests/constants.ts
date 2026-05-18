import type { RequestLifecycle, RequestUrgency } from "@/types/request";

export const REQUEST_CATEGORIES = [
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

export const REQUEST_URGENCY_OPTIONS: {
  value: RequestUrgency;
  label: string;
  description: string;
}[] = [
  { value: "flexible", label: "Flexible", description: "No rush — best price" },
  { value: "normal", label: "Normal", description: "Standard timeline" },
  { value: "urgent", label: "Urgent", description: "Need it ASAP" },
];

export const REQUEST_LIFECYCLE_OPTIONS: {
  value: RequestLifecycle;
  label: string;
}[] = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "purchased", label: "Purchased" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export const LIFECYCLE_LABELS: Record<RequestLifecycle, string> =
  Object.fromEntries(
    REQUEST_LIFECYCLE_OPTIONS.map((o) => [o.value, o.label])
  ) as Record<RequestLifecycle, string>;

export const URGENCY_LABELS: Record<RequestUrgency, string> = Object.fromEntries(
  REQUEST_URGENCY_OPTIONS.map((o) => [o.value, o.label])
) as Record<RequestUrgency, string>;

export const EDITABLE_LIFECYCLE: RequestLifecycle[] = [
  "pending",
  "accepted",
];

export const MAX_REQUEST_IMAGES = 5;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
