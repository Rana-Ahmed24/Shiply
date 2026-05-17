"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { AuthAlert } from "@/components/auth/auth-alert";
import { FieldError } from "@/components/auth/field-error";
import { updateProfileAction } from "@/lib/profile/actions";
import { LANGUAGE_OPTIONS, MEETUP_LOCATION_SUGGESTIONS } from "@/lib/profile/constants";
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
import type { PublicProfile } from "@/types/profile";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
    >
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

type ProfileEditFormProps = {
  profile: PublicProfile;
};

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, {});

  return (
    <Card className="rounded-2xl border-border/60 shadow-soft">
      <CardHeader>
        <CardTitle>Edit profile</CardTitle>
        <CardDescription>
          Update how you appear to other HitchHiker members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.error && <AuthAlert>{state.error}</AuthAlert>}
        {state.success && (
          <AuthAlert variant="success">{state.success}</AuthAlert>
        )}

        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={profile.full_name ?? ""}
              required
              className="h-11 rounded-2xl"
            />
            <FieldError messages={state.fieldErrors?.fullName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={profile.bio ?? ""}
              placeholder="Tell others about yourself…"
              className={cn(
                "w-full rounded-2xl border border-input bg-transparent px-3 py-2 text-sm",
                "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              )}
            />
            <FieldError messages={state.fieldErrors?.bio} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile.phone ?? ""}
              className="h-11 rounded-2xl"
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Languages</legend>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <label
                  key={lang}
                  className="has-checked:border-brand-gold has-checked:bg-brand-gold/10 flex cursor-pointer items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-sm"
                >
                  <input
                    type="checkbox"
                    name="languages"
                    value={lang}
                    defaultChecked={profile.languages.includes(lang)}
                    className="sr-only"
                  />
                  {lang}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="meetupLocations">
              Preferred meetup locations
            </Label>
            <Input
              id="meetupLocations"
              name="meetupLocations"
              defaultValue={profile.meetup_locations.join(", ")}
              placeholder={MEETUP_LOCATION_SUGGESTIONS.slice(0, 2).join(", ")}
              className="h-11 rounded-2xl"
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple locations with commas
            </p>
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
