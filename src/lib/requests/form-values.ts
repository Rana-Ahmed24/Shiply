import type { RequestDetail } from "@/types/request";

export type RequestFormValues = {
  title: string;
  description: string;
  itemCategory: string;
  urgency: string;
  productLink: string;
  maxBudget: string;
  neededBy: string;
  preferredOriginCountry: string;
  preferredOriginCity: string;
  publish: string;
};

export function initialRequestFormValues(
  request?: RequestDetail,
  restored?: Record<string, string>
): RequestFormValues {
  if (restored) {
    return {
      title: restored.title ?? "",
      description: restored.description ?? "",
      itemCategory: restored.itemCategory ?? "",
      urgency: restored.urgency || "normal",
      productLink: restored.productLink ?? "",
      maxBudget: restored.maxBudget ?? "",
      neededBy: restored.neededBy ?? "",
      preferredOriginCountry: restored.preferredOriginCountry ?? "",
      preferredOriginCity: restored.preferredOriginCity ?? "",
      publish: restored.publish || "open",
    };
  }

  return {
    title: request?.title ?? "",
    description: request?.description ?? "",
    itemCategory: request?.category ?? "",
    urgency: request?.urgency ?? "normal",
    productLink: request?.productLink ?? "",
    maxBudget:
      request?.maxBudget != null ? String(request.maxBudget) : "",
    neededBy: request?.neededByIso ?? "",
    preferredOriginCountry: request?.preferredOriginCountryCode ?? "",
    preferredOriginCity: request?.preferredOriginCity ?? "",
    publish: request?.status === "draft" ? "draft" : "open",
  };
}

export function isRequestFormValuesComplete(values: RequestFormValues): boolean {
  const title = values.title.trim();
  const description = values.description.trim();
  const maxBudget = values.maxBudget.trim();
  const productLink = values.productLink.trim();

  if (title.length < 3) return false;
  if (description.length < 10) return false;
  if (!values.itemCategory) return false;
  if (!maxBudget || Number(maxBudget) <= 0) return false;
  if (productLink && !/^https?:\/\/.+/i.test(productLink)) return false;

  return true;
}
