"use client";

import { useEffect } from "react";

import { setAppModeClient } from "@/lib/mode/client-store";
import type { AppMode } from "@/lib/mode/constants";

/** Syncs server-resolved mode into the client store (navbar, feeds, profile label). */
export function AppModeHydrator({ mode }: { mode: AppMode }) {
  useEffect(() => {
    setAppModeClient(mode);
  }, [mode]);

  return null;
}
