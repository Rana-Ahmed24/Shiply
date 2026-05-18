"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { AppMode } from "@/lib/mode/constants";

type Listener = () => void;

let snapshot: AppMode | null = null;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function setAppModeClient(mode: AppMode) {
  snapshot = mode;
  emit();
}

export function resetAppModeClient() {
  snapshot = null;
  emit();
}

function getSnapshot(fallback: AppMode): AppMode {
  return snapshot ?? fallback;
}

export function subscribeAppMode(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAppMode(initial: AppMode): AppMode {
  const subscribe = useCallback(
    (onStoreChange: Listener) => subscribeAppMode(onStoreChange),
    []
  );

  return useSyncExternalStore(
    subscribe,
    () => getSnapshot(initial),
    () => initial
  );
}
