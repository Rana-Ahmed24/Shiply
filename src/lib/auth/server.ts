import "server-only";

import type { User } from "@supabase/supabase-js";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  AUTH_ROUTE_PREFIXES,
  DEFAULT_LOGIN_PATH,
  PROTECTED_ROUTE_PREFIXES,
} from "@/lib/auth/config";
import { isBenignAuthError } from "@/lib/auth/errors";
import type { AuthSession, Profile } from "@/lib/auth/session";
import { hasRole, type UserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function getUser(): Promise<User | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (!isBenignAuthError(error.message)) {
      console.error("[auth] getUser failed:", error.message);
    }
    return null;
  }

  return user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[auth] getProfile failed:", error.message);
    return null;
  }

  return data;
}

export const getSession = cache(async (): Promise<AuthSession | null> => {
  const user = await getUser();
  if (!user) return null;

  const profile = await getProfile(user.id);

  const pathname = (await headers()).get("x-pathname") ?? "";
  const skipSessionIntegrity =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/listings") ||
    pathname.startsWith("/verify-traveler");

  if (
    !skipSessionIntegrity &&
    profile &&
    hasRole(profile.roles as UserRole[], "traveler")
  ) {
    const { runTravelerVerificationIntegrityForSession } = await import(
      "@/lib/verification/session-integrity"
    );
    await runTravelerVerificationIntegrityForSession(user.id);
  }

  return { user, profile };
});

export async function requireUser(redirectTo = DEFAULT_LOGIN_PATH): Promise<User> {
  const user = await getUser();
  if (!user) {
    redirect(redirectTo);
  }
  return user;
}

export async function requireSession(
  redirectTo = DEFAULT_LOGIN_PATH
): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    redirect(redirectTo);
  }
  return session;
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
