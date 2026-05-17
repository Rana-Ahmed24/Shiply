import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/auth/config";
import { getSession } from "@/lib/auth/server";

type SignupPageProps = {
  searchParams: Promise<{ redirectTo?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { redirectTo } = await searchParams;
  const session = await getSession();

  if (session) {
    redirect(redirectTo ?? DEFAULT_AUTH_REDIRECT);
  }

  return (
    <AuthShell
      title="Create account"
      description="Join Egypt's trusted traveler marketplace."
    >
      <SignupForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
