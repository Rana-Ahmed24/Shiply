"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { AuthAlert } from "@/components/auth/auth-alert";
import { FieldError } from "@/components/auth/field-error";
import { updateProfileAction } from "@/lib/profile/actions";
import {
  LANGUAGE_OPTIONS,
  MEETUP_LOCATION_SUGGESTIONS,
} from "@/lib/profile/constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

function profileFormKey(profile: PublicProfile) {
  return [
    profile.full_name ?? "",
    profile.bio ?? "",
    profile.phone ?? "",
    profile.languages.slice().sort().join(","),
    profile.meetup_locations.join(","),
  ].join("|");
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateProfileAction, {});
  const [successOpen, setSuccessOpen] = useState(false);
  const formKey = useMemo(() => profileFormKey(profile), [profile]);

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [meetupLocations, setMeetupLocations] = useState(
    profile.meetup_locations.join(", ")
  );
  const [languages, setLanguages] = useState<string[]>(profile.languages);

  useEffect(() => {
    setFullName(profile.full_name ?? "");
    setBio(profile.bio ?? "");
    setPhone(profile.phone ?? "");
    setMeetupLocations(profile.meetup_locations.join(", "));
    setLanguages(profile.languages);
  }, [formKey, profile]);

  useEffect(() => {
    if (state.success) {
      setSuccessOpen(true);
    }
  }, [state.success]);

  function goHome() {
    setSuccessOpen(false);
    router.push("/");
    router.refresh();
  }

  function handleSuccessOpenChange(open: boolean) {
    setSuccessOpen(open);
    if (!open && state.success) {
      router.push("/");
      router.refresh();
    }
  }

  function toggleLanguage(lang: string) {
    setLanguages((current) =>
      current.includes(lang)
        ? current.filter((l) => l !== lang)
        : [...current, lang]
    );
  }

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

        <Dialog open={successOpen} onOpenChange={handleSuccessOpenChange}>
          <DialogContent showCloseButton={false} className="text-center">
            <DialogHeader className="items-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                <CheckCircle2 className="size-7" aria-hidden />
              </div>
              <DialogTitle>Profile updated</DialogTitle>
              <DialogDescription>
                {state.success ??
                  "Your changes were saved. Everything looks good."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button
                type="button"
                onClick={goHome}
                className="h-11 w-full rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90 sm:w-auto sm:min-w-40"
              >
                Go to home
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <form key={formKey} action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-11 rounded-2xl"
              aria-invalid={Boolean(state.fieldErrors?.fullName)}
            />
            <FieldError messages={state.fieldErrors?.fullName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
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
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 rounded-2xl"
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Languages</legend>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((lang) => {
                const checked = languages.includes(lang);
                return (
                  <label
                    key={lang}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                      checked
                        ? "border-brand-gold bg-brand-gold/10"
                        : "border-border/60 hover:border-brand-gold/40"
                    )}
                  >
                    <input
                      type="checkbox"
                      name="languages"
                      value={lang}
                      checked={checked}
                      onChange={() => toggleLanguage(lang)}
                      className="sr-only"
                    />
                    {lang}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="meetupLocations">Preferred meetup locations</Label>
            <Input
              id="meetupLocations"
              name="meetupLocations"
              value={meetupLocations}
              onChange={(e) => setMeetupLocations(e.target.value)}
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
