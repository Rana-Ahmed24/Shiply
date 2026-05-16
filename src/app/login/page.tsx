import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/auth/config";
import { getSession } from "@/lib/auth/server";
import { cn } from "@/lib/utils";

type LoginPageProps = {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo, error } = await searchParams;
  const session = await getSession();

  if (session) {
    redirect(redirectTo ?? DEFAULT_AUTH_REDIRECT);
  }

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-display text-3xl">Sign in to Shiply</h1>
        <p className="text-lead">
          Connect your Supabase auth provider to enable login. OAuth callback:{" "}
          <code className="text-sm">/auth/callback</code>
        </p>
        {error && (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Authentication failed. Please try again.
          </p>
        )}
        <Link
          href={redirectTo ? `/signup?redirectTo=${encodeURIComponent(redirectTo)}` : "/signup"}
          className={cn(
            buttonVariants({ size: "lg" }),
            "inline-flex rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
          )}
        >
          Create an account
        </Link>
      </div>
    </Container>
  );
}
