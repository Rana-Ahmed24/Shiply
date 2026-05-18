"use client";

import { Package, Plane } from "lucide-react";
import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { useActionRedirect } from "@/hooks/use-action-redirect";

import { AuthAlert } from "@/components/auth/auth-alert";
import { FieldError } from "@/components/auth/field-error";
import { completeOnboardingAction } from "@/lib/auth/actions";
import type { AppMode } from "@/lib/mode/constants";
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

const MODE_OPTIONS: {
  value: AppMode;
  title: string;
  description: string;
  icon: typeof Package;
}[] = [
  {
    value: "customer",
    title: "Customer",
    description: "I want to send packages or create delivery requests.",
    icon: Package,
  },
  {
    value: "traveler",
    title: "Traveler",
    description: "I want to carry packages while traveling and earn money.",
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
      {pending ? "Saving…" : "Continue to Shiply"}
    </Button>
  );
}

type OnboardingFormProps = {
  defaultFullName?: string;
};

export function OnboardingForm({ defaultFullName }: OnboardingFormProps) {
  const [state, formAction] = useActionState(completeOnboardingAction, {});
  useActionRedirect(state.redirectTo);
  const [preferredMode, setPreferredMode] = useState<AppMode>("customer");

  return (
    <Card className="rounded-2xl border-border/60 shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg">How would you like to use Shiply?</CardTitle>
        <CardDescription>
          Pick your default view. You can always switch between Customer and
          Traveler mode — one account does both.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.error && <AuthAlert>{state.error}</AuthAlert>}

        <form action={formAction} className="space-y-6">
          <input type="hidden" name="preferredMode" value={preferredMode} />

          <div className="grid gap-3 sm:grid-cols-2">
            {MODE_OPTIONS.map((option) => {
              const selected = preferredMode === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPreferredMode(option.value)}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors",
                    selected
                      ? "border-brand-gold bg-brand-gold/10"
                      : "border-border/60 hover:border-brand-gold/40"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5",
                      selected ? "text-brand-gold" : "text-brand-teal"
                    )}
                    aria-hidden
                  />
                  <span className="font-semibold">{option.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
          <FieldError messages={state.fieldErrors?.preferredMode} />

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

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
