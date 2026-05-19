import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { FlashMessageDialog } from "@/components/feedback/flash-message-dialog";
import { LoginForm } from "@/components/auth/login-form";
import { AuthAlert } from "@/components/auth/auth-alert";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/auth/config";
import { mapAuthCallbackError } from "@/lib/auth/errors";
import { getSession } from "@/lib/auth/server";

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
    error?: string;
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const session = await getSession();

  if (session) {
    redirect(params.redirectTo ?? DEFAULT_AUTH_REDIRECT);
  }

  return (
    <AuthShell
      title="Sign in"
      description="Access your trips, requests, and secure deliveries."
    >
      {params.error && (
        <AuthAlert>{mapAuthCallbackError(params.error)}</AuthAlert>
      )}
      <FlashMessageDialog messageKey={params.message} />
      <LoginForm redirectTo={params.redirectTo} />
    </AuthShell>
  );
}
