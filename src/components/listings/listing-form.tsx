"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";

import { AuthAlert } from "@/components/auth/auth-alert";
import { FieldError } from "@/components/auth/field-error";
import { useActionRedirect } from "@/hooks/use-action-redirect";
import {
  createListingAction,
  updateListingAction,
} from "@/lib/listings/actions";
import {
  ARRIVAL_CITIES,
  DELIVERY_PREFERENCES,
  DEPARTURE_COUNTRIES,
  LISTING_CATEGORIES,
  SERVICE_TYPE_OPTIONS,
} from "@/lib/listings/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFormCanSubmit } from "@/hooks/use-form-can-submit";
import { isListingFormComplete } from "@/lib/listings/form-validation";
import type { ListingDetail } from "@/types/listing";
import { cn } from "@/lib/utils";

type ListingFormProps = {
  listing?: ListingDetail;
};

function SubmitButton({
  label,
  canSubmit,
}: {
  label: string;
  canSubmit: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending || !canSubmit}
      className="h-11 rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90 disabled:opacity-50"
    >
      {pending ? "Saving…" : label}
    </Button>
  );
}

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function ListingForm({ listing }: ListingFormProps) {
  const isEdit = Boolean(listing);
  const action = isEdit
    ? updateListingAction.bind(null, listing!.id)
    : createListingAction;

  const [state, formAction] = useActionState(action, {});
  useActionRedirect(state.redirectTo);

  const formRef = useRef<HTMLFormElement>(null);
  const formKey = listing?.id ?? "new";
  const canSubmit = useFormCanSubmit(formRef, formKey, isListingFormComplete);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-8"
      noValidate
    >
      {state.error && <AuthAlert>{state.error}</AuthAlert>}
      {state.success && (
        <AuthAlert variant="success">{state.success}</AuthAlert>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Route</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="originCountryCode">Departure country</Label>
            <Select
              id="originCountryCode"
              name="originCountryCode"
              required
              defaultValue={listing?.originCountryCode ?? "US"}
              className="rounded-2xl"
            >
              {DEPARTURE_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </Select>
            <FieldError messages={state.fieldErrors?.originCountryCode} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="originCity">Departure city</Label>
            <Input
              id="originCity"
              name="originCity"
              required
              defaultValue={
                listing
                  ? listing.origin.city
                  : undefined
              }
              placeholder="e.g. New York"
              className="h-11 rounded-2xl"
            />
            <FieldError messages={state.fieldErrors?.originCity} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="destinationCity">Arrival city (Egypt)</Label>
            <Select
              id="destinationCity"
              name="destinationCity"
              required
              defaultValue={listing?.destination.city ?? "Cairo"}
              className="rounded-2xl"
            >
              {ARRIVAL_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </Select>
            <FieldError messages={state.fieldErrors?.destinationCity} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Travel dates</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="departureDate">Departure (optional)</Label>
            <Input
              id="departureDate"
              name="departureDate"
              type="date"
              defaultValue={toDateInput(listing?.departureAt ?? null)}
              className="h-11 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="arrivalDate">Arrival in Egypt</Label>
            <Input
              id="arrivalDate"
              name="arrivalDate"
              type="date"
              required
              defaultValue={toDateInput(listing?.arrivalAt ?? null)}
              className="h-11 rounded-2xl"
            />
            <FieldError messages={state.fieldErrors?.arrivalDate} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Capacity & service</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="availableWeightKg">Available luggage (kg)</Label>
            <Input
              id="availableWeightKg"
              name="availableWeightKg"
              type="number"
              min={0.5}
              step={0.5}
              required
              defaultValue={listing?.availableWeightKg ?? 5}
              className="h-11 rounded-2xl"
            />
            <FieldError messages={state.fieldErrors?.availableWeightKg} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceType">Service type</Label>
            <Select
              id="serviceType"
              name="serviceType"
              defaultValue={listing?.serviceType ?? "both"}
              className="rounded-2xl"
            >
              {SERVICE_TYPE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <fieldset className="space-y-3">
        <legend className="text-lg font-semibold">Allowed categories</legend>
        <div className="flex flex-wrap gap-2">
          {LISTING_CATEGORIES.map((cat) => {
            const checked =
              listing?.categories.includes(cat) ??
              (!listing && cat === LISTING_CATEGORIES[0]);
            return (
              <label
                key={cat}
                className={cn(
                  "flex cursor-pointer items-center rounded-full border px-3 py-1.5 text-sm transition-colors",
                  checked
                    ? "border-brand-gold bg-brand-gold/10"
                    : "border-border/60"
                )}
              >
                <input
                  type="checkbox"
                  name="categories"
                  value={cat}
                  defaultChecked={checked}
                  className="sr-only"
                />
                {cat}
              </label>
            );
          })}
        </div>
        <FieldError messages={state.fieldErrors?.categories} />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-lg font-semibold">Delivery preferences</legend>
        <div className="flex flex-wrap gap-2">
          {DELIVERY_PREFERENCES.map((pref) => {
            const checked =
              listing?.deliveryPreferences.includes(pref) ?? false;
            return (
              <label
                key={pref}
                className={cn(
                  "flex cursor-pointer items-center rounded-full border px-3 py-1.5 text-sm transition-colors",
                  checked
                    ? "border-brand-teal/50 bg-brand-teal/10"
                    : "border-border/60"
                )}
              >
                <input
                  type="checkbox"
                  name="deliveryPreferences"
                  value={pref}
                  defaultChecked={checked}
                  className="sr-only"
                />
                {pref}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={listing?.notes ?? ""}
          placeholder="What you will or won't carry, meetup details, etc."
        />
        <FieldError messages={state.fieldErrors?.notes} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="publish">Visibility</Label>
        <Select
          id="publish"
          name="publish"
          defaultValue={listing?.status === "draft" ? "draft" : "active"}
          className="max-w-xs rounded-2xl"
        >
          <option value="active">Publish now (visible to customers)</option>
          <option value="draft">Save as draft</option>
        </Select>
      </div>

      <SubmitButton
        label={isEdit ? "Save listing" : "Create listing"}
        canSubmit={canSubmit}
      />
    </form>
  );
}
