"use client";

import { Suspense } from "react";

import { useQueryToast } from "@/hooks/use-query-toast";

function HomeQueryToastInner() {
  useQueryToast();
  return null;
}

export function HomeQueryToast() {
  return (
    <Suspense fallback={null}>
      <HomeQueryToastInner />
    </Suspense>
  );
}
