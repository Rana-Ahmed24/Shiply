"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { AuthAlert } from "@/components/auth/auth-alert";
import { FieldError } from "@/components/auth/field-error";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { signupAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type SignupFormProps = {
  redirectTo?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 w-full rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
    >
      {pending ? "Creating account…" : "Create account"}
    </Button>
  );
}

export function SignupForm({ redirectTo }: SignupFormProps) {
  const [state, formAction] = useActionState(signupAction, {});

  if (state.success) {
    return (
      <Card className="rounded-2xl border-border/60 shadow-soft">
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm text-muted-foreground">{state.success}</p>
          <Link
            href="/login"
            className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-brand-gold text-sm font-medium text-brand-navy hover:bg-brand-gold/90"
          >
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/60 shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg">Create your account</CardTitle>
        <CardDescription>
          Join Shiply Egypt as a customer, traveler, or both.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.error && <AuthAlert>{state.error}</AuthAlert>}

        <OAuthButtons redirectTo={redirectTo ?? "/onboarding"} />

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            or
          </span>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              autoComplete="name"
              placeholder="Your name"
              required
              className="h-11 rounded-2xl"
              aria-invalid={Boolean(state.fieldErrors?.fullName)}
            />
            <FieldError messages={state.fieldErrors?.fullName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              className="h-11 rounded-2xl"
              aria-invalid={Boolean(state.fieldErrors?.email)}
            />
            <FieldError messages={state.fieldErrors?.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="h-11 rounded-2xl"
              aria-invalid={Boolean(state.fieldErrors?.password)}
            />
            <FieldError messages={state.fieldErrors?.password} />
          </div>
          <SubmitButton />
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t-0 pt-0">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-gold hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
