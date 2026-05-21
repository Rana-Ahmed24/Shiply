/** Routes that require an authenticated session */
export const PROTECTED_ROUTE_PREFIXES = [
  "/home",
  "/dashboard",
  "/settings",
  "/messages",
  "/listings/new",
  "/requests",
  "/profile",
  "/verify-traveler",
  "/admin",
] as const;

/** Auth pages — redirect to dashboard when already signed in */
export const AUTH_ROUTE_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth",
] as const;

/** Onboarding — authenticated but pre-profile setup */
export const ONBOARDING_PATH = "/onboarding";

export const DEFAULT_LOGIN_PATH = "/login";
export const DEFAULT_AUTH_REDIRECT = "/";
