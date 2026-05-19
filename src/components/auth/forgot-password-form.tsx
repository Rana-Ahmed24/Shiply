"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { AuthAlert } from "@/components/auth/auth-alert";
import { FieldError } from "@/components/auth/field-error";
import { forgotPasswordAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 w-full rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
    >
      {pending ? "Sending…" : "Send reset link"}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, {});

  return (
    <Card className="rounded-2xl border-border/60 shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg">Reset your password</CardTitle>
        <CardDescription>
          We&apos;ll email you a secure link to choose a new password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.error && <AuthAlert>{state.error}</AuthAlert>}
        {state.success && (
          <p className="text-sm text-muted-foreground">{state.success}</p>
        )}

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-11 rounded-2xl"
              aria-invalid={Boolean(state.fieldErrors?.email)}
            />
            <FieldError messages={state.fieldErrors?.email} />
          </div>
          <SubmitButton />
        </form>

        <Link
          href="/login"
          className="block text-center text-sm text-brand-teal hover:underline"
        >
          Back to sign in
        </Link>
      </CardContent>
    </Card>
  );
}
