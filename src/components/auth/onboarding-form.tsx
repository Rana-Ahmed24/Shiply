"use client";

import { Package, Plane } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { AuthAlert } from "@/components/auth/auth-alert";
import { FieldError } from "@/components/auth/field-error";
import { completeOnboardingAction } from "@/lib/auth/actions";
import type { OnboardingRole } from "@/lib/auth/roles";
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
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: {
  value: OnboardingRole;
  label: string;
  description: string;
  icon: typeof Package;
}[] = [
  {
    value: "customer",
    label: "I need items",
    description: "Request products from abroad",
    icon: Package,
  },
  {
    value: "traveler",
    label: "I'm traveling",
    description: "Earn by bringing items to Egypt",
    icon: Plane,
  },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 w-full rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
    >
      {pending ? "Saving…" : "Continue to dashboard"}
    </Button>
  );
}

type OnboardingFormProps = {
  defaultFullName?: string;
};

export function OnboardingForm({ defaultFullName }: OnboardingFormProps) {
  const [state, formAction] = useActionState(completeOnboardingAction, {});

  return (
    <Card className="rounded-2xl border-border/60 shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg">Complete your profile</CardTitle>
        <CardDescription>
          Tell us how you&apos;ll use Shiply. You can do both later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.error && <AuthAlert>{state.error}</AuthAlert>}

        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={defaultFullName}
              autoComplete="name"
              required
              className="h-11 rounded-2xl"
              aria-invalid={Boolean(state.fieldErrors?.fullName)}
            />
            <FieldError messages={state.fieldErrors?.fullName} />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">I want to</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {ROLE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer flex-col gap-2 rounded-2xl border border-border/60 p-4 transition-colors",
                    "has-checked:border-brand-gold has-checked:bg-brand-gold/10",
                    "hover:border-brand-gold/40"
                  )}
                >
                  <input
                    type="checkbox"
                    name="roles"
                    value={option.value}
                    className="sr-only"
                  />
                  <option.icon className="size-5 text-brand-teal" aria-hidden />
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </label>
              ))}
            </div>
            <FieldError messages={state.fieldErrors?.roles} />
          </fieldset>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
