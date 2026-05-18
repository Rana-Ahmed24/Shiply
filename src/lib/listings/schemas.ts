import { z } from "zod";

import {
  ARRIVAL_CITIES,
  DELIVERY_PREFERENCES,
  LISTING_CATEGORIES,
  SERVICE_TYPE_OPTIONS,
} from "@/lib/listings/constants";

const serviceValues = SERVICE_TYPE_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

export const listingFormSchema = z
  .object({
    originCountryCode: z.string().length(2, "Select a departure country"),
    originCity: z.string().min(2, "Enter departure city").max(80),
    destinationCity: z
      .string()
      .refine(
        (v) => ARRIVAL_CITIES.includes(v as (typeof ARRIVAL_CITIES)[number]),
        "Select an arrival city in Egypt"
      ),
    departureDate: z.string().optional(),
    arrivalDate: z.string().min(1, "Arrival date is required"),
    availableWeightKg: z.coerce
      .number()
      .positive("Capacity must be greater than 0")
      .max(500, "Maximum 500 kg"),
    serviceType: z.enum(serviceValues),
    categories: z
      .array(z.string())
      .min(1, "Select at least one category")
      .refine(
        (items) =>
          items.every((c) =>
            LISTING_CATEGORIES.includes(c as (typeof LISTING_CATEGORIES)[number])
          ),
        "Invalid category selected"
      ),
    deliveryPreferences: z
      .array(z.string())
      .default([])
      .refine(
        (items) =>
          items.every((p) =>
            DELIVERY_PREFERENCES.includes(
              p as (typeof DELIVERY_PREFERENCES)[number]
            )
          ),
        "Invalid delivery preference"
      ),
    notes: z.string().max(2000).optional(),
    publish: z.enum(["active", "draft"]).default("active"),
  })
  .refine(
    (data) => {
      if (!data.departureDate) return true;
      return new Date(data.arrivalDate) >= new Date(data.departureDate);
    },
    {
      message: "Arrival must be on or after departure",
      path: ["arrivalDate"],
    }
  );

export type ListingFormInput = z.infer<typeof listingFormSchema>;
