import type { RequestsSearchParams } from "@/types/request";

/** Extract request feed params from the home page URL (prefixed with `req_`). */
export function parseRequestsSearchParams(
  params: Record<string, string | undefined>
): RequestsSearchParams {
  return {
    req_q: params.req_q,
    req_category: params.req_category,
    req_urgency: params.req_urgency,
    req_origin: params.req_origin,
    req_sort: params.req_sort,
  };
}
