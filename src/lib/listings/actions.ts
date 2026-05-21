"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  fieldErrorsFromZod,
  mapAuthError,
  type AuthActionState,
} from "@/lib/auth/errors";
import { requireUser } from "@/lib/auth/server";
import { insertListing, updateListing } from "@/lib/listings/db";
import { listingFormSchema } from "@/lib/listings/schemas";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ListingInsert = Database["public"]["Tables"]["traveler_listings"]["Insert"];

function parseListingForm(formData: FormData) {
  const categories = formData.getAll("categories") as string[];
  const deliveryPreferences = formData.getAll(
    "deliveryPreferences"
  ) as string[];

  return listingFormSchema.safeParse({
    originCountryCode: formData.get("originCountryCode"),
    originCity: formData.get("originCity"),
    destinationCity: formData.get("destinationCity"),
    departureDate: formData.get("departureDate") || undefined,
    arrivalDate: formData.get("arrivalDate"),
    availableWeightKg: formData.get("availableWeightKg"),
    serviceType: formData.get("serviceType"),
    categories,
    deliveryPreferences,
    notes: formData.get("notes") ?? "",
    publish: formData.get("publish") ?? "active",
  });
}

function toTimestamps(data: {
  departureDate?: string;
  arrivalDate: string;
}) {
  const arrival_at = new Date(`${data.arrivalDate}T12:00:00.000Z`).toISOString();
  const departure_at = data.departureDate
    ? new Date(`${data.departureDate}T08:00:00.000Z`).toISOString()
    : null;
  return { arrival_at, departure_at };
}

function listingPayload(
  userId: string,
  parsed: ReturnType<typeof listingFormSchema.parse>
): ListingInsert {
  const { arrival_at, departure_at } = toTimestamps(parsed);
  const isActive = parsed.publish === "active";

  return {
    traveler_id: userId,
    origin_city: parsed.originCity.trim(),
    origin_country_code: parsed.originCountryCode.toUpperCase(),
    destination_city: parsed.destinationCity,
    destination_country_code: "EG",
    departure_at,
    arrival_at,
    available_weight_kg: parsed.availableWeightKg,
    service_type: parsed.serviceType as ListingInsert["service_type"],
    accepted_categories: parsed.categories,
    delivery_preferences: parsed.deliveryPreferences,
    notes: parsed.notes?.trim() || null,
    status: isActive ? "active" : "draft",
    published_at: isActive ? new Date().toISOString() : null,
  };
}

export async function createListingAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const user = await requireUser("/login?redirectTo=/listings/new");
  const parsed = parseListingForm(formData);

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { data, error } = await insertListing(
    supabase,
    listingPayload(user.id, parsed.data)
  );

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return { redirectTo: `/listings/${data.id}` };
}

export async function updateListingAction(
  listingId: string,
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const user = await requireUser("/login?redirectTo=/listings/new");
  const parsed = parseListingForm(formData);

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("traveler_listings")
    .select("traveler_id")
    .eq("id", listingId)
    .maybeSingle();

  if (!existing || existing.traveler_id !== user.id) {
    return { error: "You can only edit your own listings." };
  }

  const payload = listingPayload(user.id, parsed.data);
  const { error } = await updateListing(supabase, listingId, payload);

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  revalidatePath("/");
  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/dashboard");
  revalidatePath("/");

  return { redirectTo: `/listings/${listingId}` };
}

export async function deleteListingAction(listingId: string) {
  const user = await requireUser("/login?redirectTo=/dashboard");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("traveler_listings")
    .select("traveler_id")
    .eq("id", listingId)
    .maybeSingle();

  if (!existing || existing.traveler_id !== user.id) {
    redirect("/dashboard?error=listing_delete_denied");
  }

  const { error } = await supabase
    .from("traveler_listings")
    .delete()
    .eq("id", listingId);

  if (error) {
    redirect(`/listings/${listingId}/edit?error=delete_failed`);
  }

  revalidatePath("/");
  revalidatePath("/home");
  revalidatePath("/dashboard");
  revalidatePath("/");

  redirect("/home?message=listing_deleted");
}
