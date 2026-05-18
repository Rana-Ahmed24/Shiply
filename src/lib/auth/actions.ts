"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { MODE_COOKIE } from "@/lib/mode/constants";

import {
  DEFAULT_LOGIN_PATH,
  ONBOARDING_PATH,
} from "@/lib/auth/config";
import {
  type AuthActionState,
  fieldErrorsFromZod,
  mapAuthError,
} from "@/lib/auth/errors";
import { ensureProfile, resolvePostAuthPath } from "@/lib/auth/profile";
import { updateProfileOnboarding } from "@/lib/auth/profile-update";
import type { OnboardingRole } from "@/lib/auth/roles";
import {
  forgotPasswordSchema,
  loginSchema,
  onboardingSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/auth/schemas";
import { signOut } from "@/lib/auth/server";
import {
  authCallbackUrl,
  authConfirmUrl,
  getAuthBaseUrl,
  isLocalDevUrl,
} from "@/lib/auth/urls";
import { createClient } from "@/lib/supabase/server";

function getRedirectTo(formData: FormData): string | undefined {
  const value = formData.get("redirectTo");
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: mapAuthError(error.message, error.code) };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unable to sign in. Please try again." };
  }

  const profile = await ensureProfile(supabase, user);
  const redirectTo = getRedirectTo(formData);
  return { redirectTo: resolvePostAuthPath(user, profile, redirectTo) };
}

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        onboarding_completed: false,
      },
      emailRedirectTo: await authConfirmUrl(ONBOARDING_PATH),
    },
  });

  if (error) {
    console.warn("[auth] signUp failed:", error.code, error.message);
    return { error: mapAuthError(error.message, error.code) };
  }

  if (data.user && data.user.identities?.length === 0) {
    return {
      error:
        "An account with this email already exists. Sign in, or use forgot password if you need access.",
    };
  }

  const baseUrl = await getAuthBaseUrl();
  if (isLocalDevUrl(baseUrl)) {
    return {
      success:
        "Account created. Verification emails use localhost and only work on this computer. Deploy the app (or use ngrok), set NEXT_PUBLIC_SITE_URL to that URL, update Supabase Auth URLs, then sign up again—or confirm the user manually in Supabase.",
    };
  }

  return {
    success:
      "Check your email to confirm your account, then continue to onboarding.",
  };
}

export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: await authConfirmUrl("/reset-password"),
  });

  if (error) {
    return { error: mapAuthError(error.message, error.code) };
  }

  return {
    success: "If an account exists for that email, we sent a reset link.",
  };
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: mapAuthError(error.message, error.code) };
  }

  return { redirectTo: "/login?message=password_updated" };
}

export async function signInWithGoogleAction(formData: FormData) {
  const redirectTo = getRedirectTo(formData) ?? ONBOARDING_PATH;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: await authCallbackUrl(redirectTo),
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(mapAuthError(error.message, error.code))}`
    );
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect("/login?error=oauth_failed");
}

export async function completeOnboardingAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = onboardingSchema.safeParse({
    fullName: formData.get("fullName"),
    preferredMode: formData.get("preferredMode"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error.issues) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(DEFAULT_LOGIN_PATH);
  }

  // Metadata first so middleware can proceed even if profiles column is missing
  const { error: metaError } = await supabase.auth.updateUser({
    data: {
      full_name: parsed.data.fullName,
      onboarding_completed: true,
    },
  });

  if (metaError) {
    return { error: mapAuthError(metaError.message) };
  }

  const allRoles: OnboardingRole[] = ["customer", "traveler"];

  const { error: profileError } = await updateProfileOnboarding(
    supabase,
    user.id,
    {
      full_name: parsed.data.fullName,
      roles: allRoles,
      preferred_mode: parsed.data.preferredMode,
      onboarding_completed: true,
    }
  );

  if (profileError) {
    return { error: mapAuthError(profileError.message) };
  }

  const cookieStore = await cookies();
  cookieStore.set(MODE_COOKIE, parsed.data.preferredMode, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
  return { redirectTo: "/home" };
}

export async function signOutAction() {
  await signOut();
  redirect(DEFAULT_LOGIN_PATH);
}

export async function getAuthRedirectPath(
  redirectTo?: string | null
): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return DEFAULT_LOGIN_PATH;

  const profile = await ensureProfile(supabase, user);
  return resolvePostAuthPath(user, profile, redirectTo);
}
