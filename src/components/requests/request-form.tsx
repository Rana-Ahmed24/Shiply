"use client";

import { useEffect, useMemo, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { FieldError } from "@/components/auth/field-error";
import { useActionStateToast } from "@/hooks/use-action-state-toast";
import { getCitiesForCountry } from "@/lib/geo/regions";
import { DEPARTURE_COUNTRIES } from "@/lib/listings/constants";
import {
  createRequestAction,
  updateRequestAction,
} from "@/lib/requests/actions";
import {
  MAX_REQUEST_IMAGES,
  REQUEST_CATEGORIES,
  REQUEST_URGENCY_OPTIONS,
} from "@/lib/requests/constants";
import {
  initialRequestFormValues,
  isRequestFormValuesComplete,
  type RequestFormValues,
} from "@/lib/requests/form-values";
import { localDateIso } from "@/lib/requests/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhotoFileField } from "@/components/ui/photo-file-field";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { RequestDetail } from "@/types/request";

type RequestFormProps = {
  request?: RequestDetail;
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

function requestFormMountKey(
  request: RequestDetail | undefined,
  restoredKey: string | undefined
) {
  if (restoredKey) return `restore-${restoredKey}`;
  return `${request?.id ?? "new"}-${request?.updatedAt ?? "0"}`;
}

/** Ensures controlled state is what the server action receives (first entry in FormData). */
function RequestFormSyncFields({ values }: { values: RequestFormValues }) {
  return (
    <>
      <input type="hidden" name="title" value={values.title} />
      <input type="hidden" name="description" value={values.description} />
      <input type="hidden" name="itemCategory" value={values.itemCategory} />
      <input type="hidden" name="productLink" value={values.productLink} />
      <input type="hidden" name="maxBudget" value={values.maxBudget} />
      <input type="hidden" name="urgency" value={values.urgency} />
      <input type="hidden" name="neededBy" value={values.neededBy} />
      <input
        type="hidden"
        name="preferredOriginCountry"
        value={values.preferredOriginCountry}
      />
      <input
        type="hidden"
        name="preferredOriginCity"
        value={values.preferredOriginCity}
      />
      <input type="hidden" name="publish" value={values.publish} />
    </>
  );
}

function incompleteRequestHint(values: RequestFormValues): string | null {
  const title = values.title.trim();
  const description = values.description.trim();
  const maxBudget = values.maxBudget.trim();
  const productLink = values.productLink.trim();
  const today = localDateIso();

  if (title.length < 3) return "Title must be at least 3 characters.";
  if (description.length < 10) return "Description must be at least 10 characters.";
  if (!values.itemCategory) return "Select a category.";
  if (!maxBudget || Number(maxBudget) <= 0) return "Enter a max budget in EGP.";
  if (productLink && !/^https?:\/\/.+/i.test(productLink)) {
    return "Product link must start with http:// or https://.";
  }
  if (values.neededBy.trim() && values.neededBy < today) {
    return "Needed by cannot be before today.";
  }
  return null;
}

export function RequestForm({ request }: RequestFormProps) {
  const isEdit = Boolean(request);
  const action = isEdit
    ? updateRequestAction.bind(null, request!.id)
    : createRequestAction;

  const [state, formAction] = useActionState(action, {});
  useActionStateToast(state, { errorTitle: "Could not save request" });

  const mountKey = requestFormMountKey(request, state.formKey);
  const initial = useMemo(
    () => initialRequestFormValues(request, state.values),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only on mountKey
    [mountKey]
  );

  const [values, setValues] = useState<RequestFormValues>(initial);

  useEffect(() => {
    setValues(initial);
  }, [initial]);

  const canSubmit = isRequestFormValuesComplete(values);
  const incompleteHint = incompleteRequestHint(values);
  const minNeededBy = useMemo(() => localDateIso(), []);

  const countryOptions = useMemo(
    () => [
      { value: "", label: "Any country" },
      ...DEPARTURE_COUNTRIES.map((c) => ({
        value: c.code,
        label: `${c.flag} ${c.name}`,
      })),
    ],
    []
  );

  const cityOptions = useMemo(() => {
    if (!values.preferredOriginCountry) return [];
    return [
      { value: "", label: "Any city" },
      ...getCitiesForCountry(values.preferredOriginCountry).map((city) => ({
        value: city,
        label: city,
      })),
    ];
  }, [values.preferredOriginCountry]);

  function handleCountryChange(code: string) {
    setValues((prev) => {
      const next = { ...prev, preferredOriginCountry: code };
      if (!code) {
        next.preferredOriginCity = "";
      } else if (prev.preferredOriginCity) {
        const allowed = getCitiesForCountry(code);
        if (!allowed.includes(prev.preferredOriginCity)) {
          next.preferredOriginCity = "";
        }
      }
      return next;
    });
  }

  const set =
    (key: keyof RequestFormValues) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setValues((prev) => ({ ...prev, [key]: e.target.value }));
    };

  return (
    <form
      action={formAction}
      className="space-y-8"
      noValidate
      onSubmit={(e) => {
        if (!canSubmit) e.preventDefault();
      }}
    >
      <RequestFormSyncFields values={values} />
      {isEdit && (
        <input type="hidden" name="keepExistingImages" value="true" />
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">What do you need?</h2>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            value={values.title}
            onChange={set("title")}
            placeholder="e.g. iPhone 15 Pro from Dubai"
            className="h-11 rounded-2xl"
          />
          <FieldError messages={state.fieldErrors?.title} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            required
            rows={4}
            value={values.description}
            onChange={set("description")}
            placeholder="Size, color, store, any details for the traveler…"
          />
          <FieldError messages={state.fieldErrors?.description} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="itemCategory">Category</Label>
            <Select
              id="itemCategory"
              required
              value={values.itemCategory}
              onChange={set("itemCategory")}
              className="rounded-2xl"
            >
              <option value="" disabled>
                Select category
              </option>
              {REQUEST_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
            <FieldError messages={state.fieldErrors?.itemCategory} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency</Label>
            <Select
              id="urgency"
              value={values.urgency}
              onChange={set("urgency")}
              className="rounded-2xl"
            >
              {REQUEST_URGENCY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label} — {o.description}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Product link & budget</h2>
        <div className="space-y-2">
          <Label htmlFor="productLink">Product link (optional)</Label>
          <Input
            id="productLink"
            type="text"
            inputMode="url"
            value={values.productLink}
            onChange={set("productLink")}
            placeholder="https://store.example.com/product"
            className="h-11 rounded-2xl"
          />
          <FieldError messages={state.fieldErrors?.productLink} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="maxBudget">Max budget (EGP)</Label>
            <Input
              id="maxBudget"
              name="maxBudget"
              type="number"
              min={1}
              step={1}
              required
              value={values.maxBudget}
              onChange={set("maxBudget")}
              placeholder="5000"
              className="h-11 rounded-2xl"
            />
            <FieldError messages={state.fieldErrors?.maxBudget} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="neededBy">Needed by (optional)</Label>
            <Input
              id="neededBy"
              type="date"
              min={minNeededBy}
              value={values.neededBy}
              onChange={set("neededBy")}
              className="h-11 rounded-2xl"
            />
            <FieldError messages={state.fieldErrors?.neededBy} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Photos</h2>
        <p className="text-sm text-muted-foreground">
          Upload up to {MAX_REQUEST_IMAGES} product images (max 5MB each).
          {isEdit && request?.imageUrls.length
            ? " New images will be added to existing ones."
            : ""}
          {state.error
            ? " (Re-select files after an error — browsers cannot keep them.)"
            : ""}
        </p>
        <PhotoFileField
          id="request-images"
          name="images"
          multiple
          buttonLabel="Choose photos"
          emptyLabel="No file chosen"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Origin preference (optional)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="preferredOriginCountry">Country</Label>
            <SearchableCombobox
              id="preferredOriginCountry"
              name="preferredOriginCountry"
              value={values.preferredOriginCountry}
              onValueChange={handleCountryChange}
              options={countryOptions}
              placeholder="Any country"
              searchPlaceholder="Search countries…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredOriginCity">City</Label>
            <SearchableCombobox
              id="preferredOriginCity"
              name="preferredOriginCity"
              value={values.preferredOriginCity}
              onValueChange={(v) =>
                setValues((prev) => ({ ...prev, preferredOriginCity: v }))
              }
              options={cityOptions}
              placeholder={
                values.preferredOriginCountry
                  ? "Any city"
                  : "Select a country first"
              }
              searchPlaceholder="Search cities…"
              emptyMessage={
                values.preferredOriginCountry
                  ? "No cities for this country."
                  : "Select a country first."
              }
              disabled={!values.preferredOriginCountry}
            />
          </div>
        </div>
      </section>

      <div className="space-y-2">
        <Label htmlFor="publish">Visibility</Label>
        <Select
          id="publish"
          value={values.publish}
          onChange={set("publish")}
          className="max-w-xs rounded-2xl"
        >
          <option value="open">Publish for travelers</option>
          <option value="draft">Save as draft</option>
        </Select>
      </div>

      {!canSubmit && incompleteHint ? (
        <p className="text-sm text-muted-foreground" role="status">
          {incompleteHint}
        </p>
      ) : null}

      <SubmitButton
        label={isEdit ? "Save request" : "Post request"}
        canSubmit={canSubmit}
      />
    </form>
  );
}
