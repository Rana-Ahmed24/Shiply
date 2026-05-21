import "server-only";

import { redirect } from "next/navigation";

import { hasRole } from "@/lib/auth/roles";
import { requireSession } from "@/lib/auth/server";

export async function requireAdmin(redirectTo = "/") {
  const session = await requireSession(
    `/login?redirectTo=${encodeURIComponent("/admin/verifications")}`
  );

  if (!hasRole(session.profile?.roles, "admin")) {
    redirect(redirectTo);
  }

  return session;
}
