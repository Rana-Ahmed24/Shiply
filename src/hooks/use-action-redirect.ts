"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useActionRedirect(redirectTo?: string) {
  const router = useRouter();

  useEffect(() => {
    if (redirectTo) {
      router.push(redirectTo);
      router.refresh();
    }
  }, [redirectTo, router]);
}
