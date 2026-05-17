import { z } from "zod";

import { LANGUAGE_OPTIONS } from "@/lib/profile/constants";

export const profileEditSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters"),
  bio: z.string().trim().max(500, "Bio must be 500 characters or less").optional(),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("")),
  languages: z.array(z.enum(LANGUAGE_OPTIONS)).default([]),
  meetupLocations: z
    .string()
    .trim()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    ),
});

export type ProfileEditInput = z.infer<typeof profileEditSchema>;
