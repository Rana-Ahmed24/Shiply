"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { useActionRedirect } from "@/hooks/use-action-redirect";
import { AuthAlert } from "@/components/auth/auth-alert";
import { FieldError } from "@/components/auth/field-error";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { loginAction } from "@/lib/auth/actions";
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

type LoginFormProps = {
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
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, {});
  useActionRedirect(state.redirectTo);

  return (
    <Card className="rounded-2xl border-border/60 shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg">Welcome back</CardTitle>
        <CardDescription>
          Sign in to manage trips, requests, and deliveries.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.error && <AuthAlert>{state.error}</AuthAlert>}

        <OAuthButtons redirectTo={redirectTo} />

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            or
          </span>
        </div>

        <form action={formAction} className="space-y-4">
          {redirectTo && (
            <input type="hidden" name="redirectTo" value={redirectTo} />
          )}
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-brand-teal hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
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
          New to Shiply?{" "}
          <Link
            href={
              redirectTo
                ? `/signup?redirectTo=${encodeURIComponent(redirectTo)}`
                : "/signup"
            }
            className="font-medium text-brand-gold hover:underline"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
