"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useToast } from "@/components/ui/toast-provider";

const TOAST_MESSAGES: Record<
  string,
  { variant: "success" | "error"; title: string; description: string }
> = {
  match_sent: {
    variant: "success",
    title: "Request sent",
    description:
      "Request sent to traveler. You can track it from My sent requests.",
  },
  match_accepted: {
    variant: "success",
    title: "Request accepted",
    description: "Request accepted successfully.",
  },
  match_rejected: {
    variant: "success",
    title: "Request declined",
    description: "Request rejected.",
  },
  match_cancelled: {
    variant: "success",
    title: "Request cancelled",
    description: "Your delivery request was cancelled.",
  },
};

/** Shows a toast once from ?toast= query param, then strips it from the URL. */
export function useQueryToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const shown = useRef<string | null>(null);

  useEffect(() => {
    const key = searchParams.get("toast");
    if (!key || key === shown.current) return;

    const config = TOAST_MESSAGES[key];
    if (!config) return;

    shown.current = key;
    toast(config);

    const url = new URL(window.location.href);
    url.searchParams.delete("toast");
    router.replace(url.pathname + url.search, { scroll: false });
  }, [searchParams, toast, router]);
}
