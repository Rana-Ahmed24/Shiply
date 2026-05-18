"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  fieldErrorsFromZod,
  mapAuthError,
  type AuthActionState,
} from "@/lib/auth/errors";
import { requireUser } from "@/lib/auth/server";
import { isMissingColumnError } from "@/lib/profile/db";
import {
  deleteRequest,
  insertRequest,
  updateRequest,
  updateRequestImageUrls,
} from "@/lib/requests/db";
import { MAX_IMAGE_SIZE_BYTES, MAX_REQUEST_IMAGES } from "@/lib/requests/constants";
import {
  getRequestImagesBucket,
  hasRequestImageFiles,
  isRequestImagesUploadSkippable,
  logRequestImageDebug,
} from "@/lib/requests/storage";
import { getRequestById } from "@/lib/requests/queries";
import { requestFormSchema } from "@/lib/requests/schemas";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { RequestLifecycle } from "@/types/request";

type RequestInsert = Database["public"]["Tables"]["customer_requests"]["Insert"];

function valuesFromFormData(formData: FormData): Record<string, string> {
  const str = (key: string) => String(formData.get(key) ?? "");
  return {
    title: str("title"),
    description: str("description"),
    itemCategory: str("itemCategory"),
    productLink: str("productLink"),
    maxBudget: str("maxBudget"),
    urgency: str("urgency") || "normal",
    neededBy: str("neededBy"),
    preferredOriginCountry: str("preferredOriginCountry"),
    preferredOriginCity: str("preferredOriginCity"),
    publish: str("publish") || "open",
  };
}

function failedState(
  formData: FormData,
  partial: AuthActionState
): AuthActionState {
  return {
    ...partial,
    values: valuesFromFormData(formData),
    formKey: String(Date.now()),
  };
}

function parseRequestForm(formData: FormData) {
  const maxBudgetRaw = formData.get("maxBudget");
  const weightRaw = formData.get("estimatedWeightKg");

  return requestFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    itemCategory: formData.get("itemCategory"),
    productLink: formData.get("productLink") ?? "",
    maxBudget: maxBudgetRaw,
    urgency: formData.get("urgency"),
    neededBy: formData.get("neededBy") || undefined,
    preferredOriginCountry: formData.get("preferredOriginCountry") ?? "",
    preferredOriginCity: formData.get("preferredOriginCity") ?? "",
    estimatedWeightKg:
      weightRaw === "" || weightRaw === null ? undefined : weightRaw,
    publish: formData.get("publish") ?? "open",
  });
}

function requestPayload(
  customerId: string,
  parsed: ReturnType<typeof requestFormSchema.parse>,
  imageUrls: string[]
): RequestInsert {
  const isOpen = parsed.publish === "open";

  return {
    customer_id: customerId,
    title: parsed.title,
    description: parsed.description,
    item_category: parsed.itemCategory,
    estimated_weight_kg: parsed.estimatedWeightKg ?? null,
    max_budget: parsed.maxBudget ?? null,
    currency: "EGP",
    preferred_origin_country_code: parsed.preferredOriginCountry
      ? parsed.preferredOriginCountry.toUpperCase()
      : null,
    preferred_origin_city: parsed.preferredOriginCity?.trim() || null,
    needed_by: parsed.neededBy || null,
    product_link: parsed.productLink?.trim() || null,
    urgency: parsed.urgency as RequestInsert["urgency"],
    image_urls: imageUrls,
    lifecycle_status: isOpen ? "pending" : ("pending" as RequestLifecycle),
    status: isOpen ? "open" : "draft",
    published_at: isOpen ? new Date().toISOString() : null,
  };
}

async function uploadRequestImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  customerId: string,
  requestId: string,
  formData: FormData
): Promise<{ urls: string[]; error?: string }> {
  const bucket = getRequestImagesBucket();
  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  logRequestImageDebug("selected files", {
    count: files.length,
    names: files.map((f) => f.name),
    bucket,
  });

  if (files.length === 0) {
    return { urls: [] };
  }

  if (files.length > MAX_REQUEST_IMAGES) {
    return { urls: [], error: `You can upload up to ${MAX_REQUEST_IMAGES} images.` };
  }

  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return { urls: [], error: "Each image must be smaller than 5MB." };
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${customerId}/${requestId}/${i}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type || undefined,
        upsert: true,
      });

    if (uploadError) {
      logRequestImageDebug("upload error", uploadError);
      return { urls: [], error: mapAuthError(uploadError.message) };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    logRequestImageDebug("upload ok", { path, publicUrl });
    urls.push(publicUrl);
  }

  return { urls };
}

export async function createRequestAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const user = await requireUser("/login?redirectTo=/requests/new");
  const parsed = parseRequestForm(formData);

  if (!parsed.success) {
    return failedState(formData, {
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    });
  }

  const supabase = await createClient();
  const draftPayload = requestPayload(user.id, parsed.data, []);

  const { data, error } = await insertRequest(supabase, draftPayload);

  if (error || !data) {
    return failedState(formData, {
      error: mapAuthError(error?.message ?? "Could not create request."),
    });
  }

  const { urls, error: uploadError } = await uploadRequestImages(
    supabase,
    user.id,
    data.id,
    formData
  );

  if (uploadError) {
    if (
      isRequestImagesUploadSkippable(uploadError) &&
      hasRequestImageFiles(formData)
    ) {
      revalidatePath("/requests");
      revalidatePath("/dashboard");
      return {
        redirectTo: `/requests/${data.id}?warning=images_storage`,
      };
    }

    await deleteRequest(supabase, data.id);
    return failedState(formData, {
      error: `${uploadError} Your text fields are restored below; re-select photos and try again.`,
    });
  }

  if (urls.length > 0) {
    const { error: imageUpdateError } = await updateRequestImageUrls(
      supabase,
      data.id,
      urls
    );
    logRequestImageDebug("persist image_urls", {
      requestId: data.id,
      urls,
      error: imageUpdateError?.message,
    });
    if (imageUpdateError) {
      return failedState(formData, {
        error: mapAuthError(
          imageUpdateError.message ?? "Could not save image URLs on the request."
        ),
      });
    }
  }

  revalidatePath("/requests");
  revalidatePath("/home");
  revalidatePath("/dashboard");

  return { redirectTo: `/requests/${data.id}` };
}

export async function updateRequestAction(
  requestId: string,
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const user = await requireUser("/login?redirectTo=/requests/new");
  const parsed = parseRequestForm(formData);

  if (!parsed.success) {
    return failedState(formData, {
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    });
  }

  const existing = await getRequestById(requestId, user.id);

  if (!existing || existing.customerId !== user.id) {
    return failedState(formData, {
      error: "You can only edit your own requests.",
    });
  }

  if (
    existing.lifecycle === "cancelled" ||
    existing.lifecycle === "delivered"
  ) {
    return failedState(formData, {
      error: "This request can no longer be edited.",
    });
  }

  const supabase = await createClient();
  const keepExisting = formData.get("keepExistingImages") === "true";
  let imageUrls = keepExisting ? existing.imageUrls : [];

  const { urls: newUrls, error: uploadError } = await uploadRequestImages(
    supabase,
    user.id,
    requestId,
    formData
  );

  const uploadSkippable =
    uploadError &&
    isRequestImagesUploadSkippable(uploadError) &&
    hasRequestImageFiles(formData);

  if (uploadError && !uploadSkippable) {
    return failedState(formData, {
      error: `${uploadError} Your text fields are restored below; re-select photos and try again.`,
    });
  }

  if (newUrls.length > 0) {
    imageUrls = keepExisting
      ? [...imageUrls, ...newUrls].slice(0, MAX_REQUEST_IMAGES)
      : newUrls;
    const { error: imageUpdateError } = await updateRequestImageUrls(
      supabase,
      requestId,
      imageUrls
    );
    logRequestImageDebug("update image_urls", {
      requestId,
      imageUrls,
      error: imageUpdateError?.message,
    });
    if (imageUpdateError) {
      return failedState(formData, {
        error: mapAuthError(imageUpdateError.message ?? "Could not save images."),
      });
    }
  }

  const payload = requestPayload(user.id, parsed.data, imageUrls);
  const { error } = await updateRequest(supabase, requestId, payload);

  if (error) {
    return failedState(formData, { error: mapAuthError(error.message) });
  }

  revalidatePath("/requests");
  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/dashboard");

  return {
    redirectTo: uploadSkippable
      ? `/requests/${requestId}?warning=images_storage`
      : `/requests/${requestId}`,
  };
}

export async function cancelRequestAction(requestId: string) {
  const user = await requireUser("/login?redirectTo=/requests");

  const existing = await getRequestById(requestId, user.id);

  if (!existing || existing.customerId !== user.id) {
    redirect("/requests?error=cancel_denied");
  }

  if (existing.lifecycle === "delivered") {
    redirect(`/requests/${requestId}?error=cannot_cancel`);
  }

  const supabase = await createClient();

  let { error } = await supabase
    .from("customer_requests")
    .update({
      status: "cancelled",
      lifecycle_status: "cancelled",
    })
    .eq("id", requestId);

  if (error && isMissingColumnError(error.message)) {
    ({ error } = await supabase
      .from("customer_requests")
      .update({ status: "cancelled" })
      .eq("id", requestId));
  }

  if (error) {
    redirect(`/requests/${requestId}?error=cancel_failed`);
  }

  revalidatePath("/requests");
  revalidatePath("/dashboard");
  revalidatePath(`/requests/${requestId}`);

  redirect("/requests?message=cancelled");
}

export async function deleteRequestAction(requestId: string) {
  const user = await requireUser("/login?redirectTo=/requests");

  const existing = await getRequestById(requestId, user.id);

  if (!existing || existing.customerId !== user.id) {
    redirect("/requests?error=delete_denied");
  }

  const supabase = await createClient();

  const bucket = getRequestImagesBucket();
  const { data: files } = await supabase.storage
    .from(bucket)
    .list(`${user.id}/${requestId}`);

  if (files?.length) {
    const paths = files.map((f) => `${user.id}/${requestId}/${f.name}`);
    await supabase.storage.from(bucket).remove(paths);
  }

  const { error } = await deleteRequest(supabase, requestId);

  if (error) {
    const reason = mapAuthError(error.message);
    if (reason.includes("row-level security")) {
      redirect(
        `/requests?error=delete_policy&reason=${encodeURIComponent(reason)}`
      );
    }
    if (reason.includes("linked to an active delivery")) {
      redirect(`/requests/${requestId}?error=delete_linked`);
    }
    redirect(`/requests/${requestId}?error=delete_failed`);
  }

  revalidatePath("/requests");
  revalidatePath("/dashboard");
  revalidatePath("/");

  redirect("/requests?message=deleted");
}
