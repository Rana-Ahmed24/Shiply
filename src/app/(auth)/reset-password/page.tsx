import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { DEFAULT_LOGIN_PATH } from "@/lib/auth/config";
import { getUser } from "@/lib/auth/server";

export default async function ResetPasswordPage() {
  const user = await getUser();

  if (!user) {
    redirect(`${DEFAULT_LOGIN_PATH}?error=session_required`);
  }

  return (
    <AuthShell
      title="New password"
      description="Choose a strong password for your account."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
