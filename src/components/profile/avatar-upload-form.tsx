"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";

import { AuthAlert } from "@/components/auth/auth-alert";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { uploadAvatarAction } from "@/lib/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AvatarUploadFormProps = {
  name: string | null;
  avatarUrl: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="sm"
      disabled={pending}
      className="rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
    >
      {pending ? "Uploading…" : "Upload photo"}
    </Button>
  );
}

export function AvatarUploadForm({ name, avatarUrl }: AvatarUploadFormProps) {
  const [state, formAction] = useActionState(uploadAvatarAction, {});
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <ProfileAvatar name={name} avatarUrl={avatarUrl} size="lg" />
      <div className="w-full space-y-3">
        {state.error && <AuthAlert>{state.error}</AuthAlert>}
        {state.success && (
          <AuthAlert variant="success">{state.success}</AuthAlert>
        )}
        <form action={formAction} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="avatar">Profile photo</Label>
            <Input
              ref={inputRef}
              id="avatar"
              name="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="rounded-2xl"
            />
          </div>
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
