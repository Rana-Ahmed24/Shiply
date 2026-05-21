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
  /** Restores text/select fields after a failed submit (remount via formKey) */
  values?: Record<string, string>;
  formKey?: string;
};

export function mapAuthError(message: string, code?: string): string {
  const normalized = message.toLowerCase();
  const errorCode = (code ?? "").toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (
    normalized.includes("user already registered") ||
    errorCode === "user_already_exists"
  ) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }
  if (
    errorCode === "email_address_invalid" ||
    (normalized.includes("invalid") && normalized.includes("email"))
  ) {
    return "That email address was rejected. Check for typos (e.g. name@gmail.com) or try a different address.";
  }
  if (
    errorCode === "over_email_send_rate_limit" ||
    normalized.includes("email rate limit") ||
    normalized.includes("over_email_send")
  ) {
    return "Verification emails are temporarily limited (Supabase allows about 2 per hour on the free plan). Wait up to an hour, then try again—or sign in if you already received a confirmation email. For development, use custom SMTP or turn off “Confirm email” in Supabase Auth settings.";
  }
  if (
    errorCode.includes("rate_limit") ||
    normalized.includes("rate limit") ||
    normalized.includes("too many requests")
  ) {
    return "Too many attempts from this app. Please wait a few minutes and try again.";
  }
  if (normalized.includes("bucket not found")) {
    if (normalized.includes("traveler-verification")) {
      return "Storage bucket traveler-verifications is missing. Run supabase/scripts/setup-traveler-verifications.sql in the Supabase SQL Editor.";
    }
    return "Image storage bucket request-images is missing. Create it in Supabase → Storage (public bucket) or run supabase/scripts/setup-request-images-storage.sql in the SQL Editor.";
  }
  if (normalized.includes("row-level security")) {
    return "Upload was blocked by storage security rules. Run supabase/scripts/fix-traveler-verifications-storage-policies.sql in the Supabase SQL Editor, then try again.";
  }
  if (
    normalized.includes("foreign key") ||
    normalized.includes("violates foreign key")
  ) {
    return "This item is linked to an active delivery and cannot be deleted yet.";
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
