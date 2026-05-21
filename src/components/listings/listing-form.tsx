"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { FieldError } from "@/components/auth/field-error";
import { useActionRedirect } from "@/hooks/use-action-redirect";
import { useActionStateToast } from "@/hooks/use-action-state-toast";
import {
  createListingAction,
  updateListingAction,
} from "@/lib/listings/actions";
import {
  DELIVERY_PREFERENCES,
  DEPARTURE_COUNTRIES,
  LISTING_CATEGORIES,
  SERVICE_TYPE_OPTIONS,
} from "@/lib/listings/constants";
import {
  initialListingFormValues,
  isListingFormValuesComplete,
  type ListingFormValues,
} from "@/lib/listings/form-values";
import { SORTED_EGYPT_CITIES } from "@/lib/geo/cities";
import {
  getDepartureCitiesForCountry,
  pickOriginCityForCountry,
} from "@/lib/geo/cities-by-country";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { localDateIso, minSelectableDateIso } from "@/lib/format/date";
import { Label } from "@/components/ui/label";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleChipGroup } from "@/components/ui/toggle-chip-group";
import type { ListingDetail } from "@/types/listing";

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

export function ListingForm({ listing }: ListingFormProps) {
  const isEdit = Boolean(listing);
  const action = isEdit
    ? updateListingAction.bind(null, listing!.id)
    : createListingAction;

  const [state, formAction] = useActionState(action, {});
  useActionRedirect(state.redirectTo);
  useActionStateToast(state, { errorTitle: "Could not save listing" });

  const mountKey = listing?.id ?? "new";
  const initial = useMemo(
    () => initialListingFormValues(listing),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when listing identity changes
    [mountKey]
  );

  const [values, setValues] = useState<ListingFormValues>(initial);

  const canSubmit = isListingFormValuesComplete(values);
  const today = useMemo(() => localDateIso(), []);
  const minArrivalDate = useMemo(
    () => minSelectableDateIso(values.departureDate || undefined),
    [values.departureDate]
  );

  const set =
    (key: keyof ListingFormValues) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setValues((prev) => ({ ...prev, [key]: e.target.value }));
    };

  function handleDepartureDateChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const departureDate = e.target.value;
    setValues((prev) => {
      const next = { ...prev, departureDate };
      if (
        prev.arrivalDate &&
        departureDate &&
        prev.arrivalDate < departureDate
      ) {
        next.arrivalDate = "";
      }
      if (prev.arrivalDate && prev.arrivalDate < today) {
        next.arrivalDate = "";
      }
      return next;
    });
  }

  const countryOptions = useMemo(
    () =>
      DEPARTURE_COUNTRIES.map((c) => ({
        value: c.code,
        label: `${c.flag} ${c.name}`,
      })),
    []
  );

  const egyptCityOptions = useMemo(
    () =>
      SORTED_EGYPT_CITIES.map((city) => ({
        value: city,
        label: city,
      })),
    []
  );

  const departureCityOptions = useMemo(() => {
    const base = getDepartureCitiesForCountry(values.originCountryCode).map(
      (city) => ({ value: city, label: city })
    );
    const current = values.originCity;
    if (current && !base.some((o) => o.value === current)) {
      return [{ value: current, label: current }, ...base];
    }
    return base;
  }, [values.originCountryCode, values.originCity]);

  function handleOriginCountryChange(countryCode: string) {
    setValues((prev) => ({
      ...prev,
      originCountryCode: countryCode,
      originCity: pickOriginCityForCountry(countryCode, prev.originCity),
    }));
  }

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <section className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-foreground">Route</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="originCountryCode">Departure country</Label>
            <SearchableCombobox
              id="originCountryCode"
              name="originCountryCode"
              required
              value={values.originCountryCode}
              onValueChange={handleOriginCountryChange}
              options={countryOptions}
              placeholder="Select country"
              searchPlaceholder="Search countries…"
            />
            <FieldError messages={state.fieldErrors?.originCountryCode} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="originCity">Departure city</Label>
            <SearchableCombobox
              id="originCity"
              name="originCity"
              required
              allowCustomValue
              value={values.originCity}
              onValueChange={(v) =>
                setValues((prev) => ({ ...prev, originCity: v }))
              }
              options={departureCityOptions}
              placeholder={
                departureCityOptions.length > 0
                  ? "Select or search city"
                  : "Type your departure city"
              }
              searchPlaceholder={
                departureCityOptions.length > 0
                  ? "Search cities in this country…"
                  : "Enter departure city name…"
              }
              emptyMessage="Type at least 2 characters, then choose “Use …” below."
            />
            <FieldError messages={state.fieldErrors?.originCity} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="destinationCity">Arrival city (Egypt)</Label>
            <SearchableCombobox
              id="destinationCity"
              name="destinationCity"
              required
              value={values.destinationCity}
              onValueChange={(v) =>
                setValues((prev) => ({ ...prev, destinationCity: v }))
              }
              options={egyptCityOptions}
              placeholder="Select city"
              searchPlaceholder="Search Egyptian cities…"
            />
            <FieldError messages={state.fieldErrors?.destinationCity} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-foreground">Travel dates</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="departureDate">Departure (optional)</Label>
            <DateInput
              id="departureDate"
              name="departureDate"
              value={values.departureDate}
              onChange={handleDepartureDateChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="arrivalDate">Arrival in Egypt</Label>
            <DateInput
              id="arrivalDate"
              name="arrivalDate"
              required
              minDate={minArrivalDate}
              value={values.arrivalDate}
              onChange={set("arrivalDate")}
            />
            <FieldError messages={state.fieldErrors?.arrivalDate} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-foreground">
          Capacity & service
        </h2>
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
              value={values.availableWeightKg}
              onChange={set("availableWeightKg")}
              className="h-11 rounded-2xl"
            />
            <FieldError messages={state.fieldErrors?.availableWeightKg} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceType">Service type</Label>
            <Select
              id="serviceType"
              name="serviceType"
              value={values.serviceType}
              onChange={set("serviceType")}
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

      <fieldset className="space-y-3 rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
        <legend className="text-base font-semibold text-foreground">
          Allowed categories
        </legend>
        <p className="text-sm text-muted-foreground">
          Select all product types you are willing to carry.
        </p>
        <ToggleChipGroup
          name="categories"
          options={LISTING_CATEGORIES}
          value={values.categories}
          onChange={(categories) =>
            setValues((prev) => ({ ...prev, categories }))
          }
          minSelected={1}
        />
        <FieldError messages={state.fieldErrors?.categories} />
      </fieldset>

      <fieldset className="space-y-3 rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
        <legend className="text-base font-semibold text-foreground">
          Delivery preferences
        </legend>
        <p className="text-sm text-muted-foreground">
          Choose how you prefer to hand off packages.
        </p>
        <ToggleChipGroup
          name="deliveryPreferences"
          options={DELIVERY_PREFERENCES}
          value={values.deliveryPreferences}
          onChange={(deliveryPreferences) =>
            setValues((prev) => ({ ...prev, deliveryPreferences }))
          }
          activeClassName="border-brand-teal/50 bg-brand-teal/15"
        />
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          value={values.notes}
          onChange={set("notes")}
          placeholder="What you will or won't carry, meetup details, etc."
        />
        <FieldError messages={state.fieldErrors?.notes} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="publish">Visibility</Label>
        <Select
          id="publish"
          name="publish"
          value={values.publish}
          onChange={set("publish")}
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
