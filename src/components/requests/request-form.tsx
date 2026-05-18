"use client";

import { useEffect, useMemo, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { AuthAlert } from "@/components/auth/auth-alert";
import { FieldError } from "@/components/auth/field-error";
import { useActionRedirect } from "@/hooks/use-action-redirect";
import {
  createRequestAction,
  updateRequestAction,
} from "@/lib/requests/actions";
import { DEPARTURE_COUNTRIES } from "@/lib/listings/constants";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function RequestForm({ request }: RequestFormProps) {
  const isEdit = Boolean(request);
  const action = isEdit
    ? updateRequestAction.bind(null, request!.id)
    : createRequestAction;

  const [state, formAction] = useActionState(action, {});
  useActionRedirect(state.redirectTo);

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
    <form action={formAction} className="space-y-8" noValidate>
      {state.error && <AuthAlert>{state.error}</AuthAlert>}

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
            name="description"
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
              name="itemCategory"
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
              name="urgency"
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
            name="productLink"
            type="url"
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
              name="neededBy"
              type="date"
              value={values.neededBy}
              onChange={set("neededBy")}
              className="h-11 rounded-2xl"
            />
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
        <Input
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="rounded-2xl"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Origin preference (optional)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="preferredOriginCountry">Country</Label>
            <Select
              id="preferredOriginCountry"
              name="preferredOriginCountry"
              value={values.preferredOriginCountry}
              onChange={set("preferredOriginCountry")}
              className="rounded-2xl"
            >
              <option value="">Any country</option>
              {DEPARTURE_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredOriginCity">City</Label>
            <Input
              id="preferredOriginCity"
              name="preferredOriginCity"
              value={values.preferredOriginCity}
              onChange={set("preferredOriginCity")}
              placeholder="e.g. Dubai"
              className="h-11 rounded-2xl"
            />
          </div>
        </div>
      </section>

      <div className="space-y-2">
        <Label htmlFor="publish">Visibility</Label>
        <Select
          id="publish"
          name="publish"
          value={values.publish}
          onChange={set("publish")}
          className="max-w-xs rounded-2xl"
        >
          <option value="open">Publish for travelers</option>
          <option value="draft">Save as draft</option>
        </Select>
      </div>

      <SubmitButton
        label={isEdit ? "Save request" : "Post request"}
        canSubmit={canSubmit}
      />
    </form>
  );
}
