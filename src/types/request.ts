export type RequestUrgency = "flexible" | "normal" | "urgent";

export type RequestLifecycle =
  | "pending"
  | "accepted"
  | "purchased"
  | "shipped"
  | "delivered"
  | "cancelled";

/** Legacy DB status — kept for RLS / matches */
export type RequestDbStatus =
  | "draft"
  | "open"
  | "matched"
  | "in_progress"
  | "fulfilled"
  | "cancelled"
  | "expired";

export type CustomerRequestRow = {
  id: string;
  customer_id: string;
  title: string;
  description: string;
  item_category: string;
  estimated_weight_kg: number | null;
  max_budget: number | null;
  currency: string;
  preferred_origin_country_code: string | null;
  preferred_origin_city: string | null;
  needed_by: string | null;
  status: RequestDbStatus;
  lifecycle_status: RequestLifecycle;
  product_link: string | null;
  urgency: RequestUrgency;
  image_urls: string[];
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RequestCardModel = {
  id: string;
  href: string;
  title: string;
  descriptionPreview: string;
  category: string;
  budgetLabel: string | null;
  urgency: RequestUrgency;
  urgencyLabel: string;
  lifecycle: RequestLifecycle;
  lifecycleLabel: string;
  imageUrl: string | null;
  productLink: string | null;
  neededBy: string | null;
  pickupLabel: string;
  destinationLabel: string;
  packageSizeLabel: string | null;
  createdAt: string;
  customerId: string;
  canEdit: boolean;
};

export type RequestSort = "newest" | "needed_by_asc" | "budget_desc" | "urgency";

export type RequestsSearchParams = {
  req_q?: string;
  req_category?: string;
  req_urgency?: string;
  req_origin?: string;
  req_city?: string;
  req_sort?: string;
};

export type RequestDetail = RequestCardModel & {
  description: string;
  imageUrls: string[];
  estimatedWeightKg: number | null;
  maxBudget: number | null;
  currency: string;
  /** ISO date (yyyy-mm-dd) for form inputs */
  neededByIso: string | null;
  preferredOriginCountryCode: string | null;
  preferredOriginCity: string | null;
  status: RequestDbStatus;
  updatedAt: string;
};
