import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { DEFAULT_LOGIN_PATH } from "@/lib/auth/config";
import { needsOnboarding } from "@/lib/auth/profile";
import { getSession } from "@/lib/auth/server";

export default async function OnboardingPage() {
  const session = await getSession();

  if (!session) {
    redirect(DEFAULT_LOGIN_PATH);
  }

  if (!needsOnboarding(session.user, session.profile)) {
    redirect("/");
  }

  const defaultFullName =
    session.profile?.full_name ??
    (session.user.user_metadata?.full_name as string | undefined);

  return (
    <AuthShell
      title="Almost there"
      description="Set up your profile to start using Shiply."
    >
      <OnboardingForm defaultFullName={defaultFullName} />
    </AuthShell>
  );
}
