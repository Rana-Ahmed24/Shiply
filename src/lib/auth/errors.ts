/** Expected when no one is signed in (e.g. after logout). Not a server fault. */
export function isBenignAuthError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("auth session missing") ||
    normalized.includes("jwt expired") ||
    normalized.includes("invalid refresh token") ||
    normalized.includes("refresh token not found")
  );
}

export type AuthActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
  /** Client navigates here — avoids redirect() + useActionState runtime errors */
  redirectTo?: string;
};

export function mapAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (normalized.includes("user already registered")) {
    return "An account with this email already exists.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }
  if (normalized.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  return message;
}

export function mapAuthCallbackError(errorParam: string): string {
  const decoded = decodeURIComponent(errorParam);
  const normalized = decoded.toLowerCase();

  if (
    normalized.includes("auth_callback_failed") ||
    normalized.includes("auth_confirm_failed")
  ) {
    return "This sign-in or verification link is invalid or expired. Request a new email or try signing in again.";
  }
  if (normalized.includes("pkce") || normalized.includes("code verifier")) {
    return "Open the verification link in the same browser you used to sign up, or ask for a new confirmation email.";
  }

  return mapAuthError(decoded);
}

export function fieldErrorsFromZod(
  issues: { path: PropertyKey[]; message: string }[]
): Record<string, string[]> {
  return issues.reduce<Record<string, string[]>>((acc, issue) => {
    const key = String(issue.path[0] ?? "form");
    acc[key] = [...(acc[key] ?? []), issue.message];
    return acc;
  }, {});
}
