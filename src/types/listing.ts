export type ListingStatus =
  | "draft"
  | "active"
  | "paused"
  | "expired"
  | "cancelled";

export type ServiceType = "shop_and_ship" | "ship_only" | "both";

export type TravelerListingRow = {
  id: string;
  traveler_id: string;
  origin_city: string;
  origin_country_code: string;
  destination_city: string;
  destination_country_code: string;
  departure_at: string | null;
  arrival_at: string;
  available_weight_kg: number;
  service_type: ServiceType;
  accepted_categories: string[];
  notes: string | null;
  delivery_preferences: string[];
  status: ListingStatus;
  published_at: string | null;
  expires_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type ListingTravelerSummary = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  traveler_rating_avg: number | null;
  traveler_review_count: number;
};

export type ListingCardModel = {
  id: string;
  href: string;
  origin: { city: string; country: string; flag: string };
  destination: { city: string; country: string; flag: string };
  arrives: string;
  departs: string | null;
  capacity: string;
  service: string;
  rating: number;
  verified: boolean;
  categories: string[];
  deliveryPreferences: string[];
  notesPreview: string | null;
  status: ListingStatus;
  travelerId: string;
  travelerName: string | null;
  travelerAvatarUrl: string | null;
  reviewCount: number;
};

/** @deprecated Use ListingCardModel — kept for marketing mock compatibility */
export type TravelerListing = Omit<
  ListingCardModel,
  | "href"
  | "departs"
  | "deliveryPreferences"
  | "notesPreview"
  | "status"
  | "travelerId"
  | "travelerName"
>;

export type ListingDetail = ListingCardModel & {
  notes: string | null;
  availableWeightKg: number;
  originCountryCode: string;
  departureAt: string | null;
  arrivalAt: string;
  serviceType: ServiceType;
  createdAt: string;
  traveler: ListingTravelerSummary | null;
};

export type ListingsSearchParams = {
  q?: string;
  origin?: string;
  origin_city?: string;
  destination?: string;
  category?: string;
  service?: string;
  sort?: string;
  page?: string;
};

export type ListingsPageResult = {
  listings: ListingCardModel[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
