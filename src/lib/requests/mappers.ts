import { formatShortDateUtc } from "@/lib/format/date";
import { countryName } from "@/lib/listings/constants";
import {
  LIFECYCLE_LABELS,
  URGENCY_LABELS,
} from "@/lib/requests/constants";
import type {
  CustomerRequestRow,
  RequestCardModel,
  RequestDetail,
} from "@/types/request";

function formatBudget(
  maxBudget: number | null,
  currency: string
): string | null {
  if (maxBudget == null) return null;
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(maxBudget);
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const base = formatShortDateUtc(iso);
  const year = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
  return `${base}, ${year}`;
}

export function mapRequestToCard(
  row: CustomerRequestRow,
  options?: { viewerId?: string | null }
): RequestCardModel {
  const canEdit =
    options?.viewerId === row.customer_id &&
    row.lifecycle_status !== "cancelled" &&
    row.lifecycle_status !== "delivered";

  const pickup =
    row.preferred_origin_city?.trim() ||
    (row.preferred_origin_country_code
      ? countryName(row.preferred_origin_country_code)
      : null) ||
    "Any origin";

  return {
    id: row.id,
    href: `/requests/${row.id}`,
    title: row.title,
    descriptionPreview:
      row.description.length > 140
        ? `${row.description.slice(0, 140)}…`
        : row.description,
    category: row.item_category,
    budgetLabel: formatBudget(row.max_budget, row.currency),
    urgency: row.urgency,
    urgencyLabel: URGENCY_LABELS[row.urgency],
    lifecycle: row.lifecycle_status,
    lifecycleLabel: LIFECYCLE_LABELS[row.lifecycle_status],
    imageUrl: row.image_urls[0] ?? null,
    productLink: row.product_link,
    neededBy: formatDate(row.needed_by),
    pickupLabel: pickup,
    destinationLabel: "Egypt",
    packageSizeLabel:
      row.estimated_weight_kg != null
        ? `${row.estimated_weight_kg} kg`
        : null,
    createdAt: row.created_at,
    customerId: row.customer_id,
    canEdit,
  };
}

export function mapRequestToDetail(
  row: CustomerRequestRow,
  options?: { viewerId?: string | null }
): RequestDetail {
  const card = mapRequestToCard(row, options);
  return {
    ...card,
    description: row.description,
    imageUrls: row.image_urls,
    estimatedWeightKg: row.estimated_weight_kg,
    maxBudget: row.max_budget,
    currency: row.currency,
    neededByIso: row.needed_by ? row.needed_by.slice(0, 10) : null,
    preferredOriginCountryCode: row.preferred_origin_country_code,
    preferredOriginCity: row.preferred_origin_city,
    status: row.status,
    updatedAt: row.updated_at,
  };
}
