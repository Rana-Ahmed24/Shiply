import { z } from "zod";

import { localDateIso } from "@/lib/format/date";
import { REQUEST_CATEGORIES, REQUEST_URGENCY_OPTIONS } from "@/lib/requests/constants";

export { localDateIso };

const urgencyValues = REQUEST_URGENCY_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

export const requestFormSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  description: z
    .string()
    .trim()
    .min(10, "Describe what you need in at least 10 characters")
    .max(3000),
  itemCategory: z
    .string()
    .refine(
      (v) => REQUEST_CATEGORIES.includes(v as (typeof REQUEST_CATEGORIES)[number]),
      "Select a category"
    ),
  productLink: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || v.length === 0 || /^https?:\/\/.+/i.test(v),
      "Enter a valid URL starting with http:// or https://"
    ),
  maxBudget: z.coerce
    .number({ message: "Enter your max budget in EGP" })
    .positive("Budget must be greater than 0")
    .max(1_000_000),
  urgency: z.enum(urgencyValues),
  neededBy: z
    .string()
    .optional()
    .refine(
      (v) => !v || v >= localDateIso(),
      "Needed by cannot be before today"
    ),
  preferredOriginCountry: z
    .string()
    .optional()
    .transform((v) => (v && v.length === 2 ? v : undefined)),
  preferredOriginCity: z.string().max(80).optional(),
  estimatedWeightKg: z
    .union([z.coerce.number().positive().max(500), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
  publish: z.enum(["open", "draft"]).default("open"),
});

export type RequestFormInput = z.infer<typeof requestFormSchema>;
