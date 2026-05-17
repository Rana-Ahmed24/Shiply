"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { useActionRedirect } from "@/hooks/use-action-redirect";
import { AuthAlert } from "@/components/auth/auth-alert";
import { FieldError } from "@/components/auth/field-error";
import { resetPasswordAction } from "@/lib/auth/actions";
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
      {pending ? "Updating…" : "Update password"}
    </Button>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, {});
  useActionRedirect(state.redirectTo);

  return (
    <Card className="rounded-2xl border-border/60 shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg">Choose a new password</CardTitle>
        <CardDescription>Must be at least 8 characters.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.error && <AuthAlert>{state.error}</AuthAlert>}

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="h-11 rounded-2xl"
              aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
            />
            <FieldError messages={state.fieldErrors?.confirmPassword} />
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
