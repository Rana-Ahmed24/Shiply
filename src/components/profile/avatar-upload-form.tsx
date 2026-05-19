"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";

import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { PhotoFileField } from "@/components/ui/photo-file-field";
import { useActionStateToast } from "@/hooks/use-action-state-toast";
import { uploadAvatarAction } from "@/lib/profile/actions";

type AvatarUploadFormProps = {
  name: string | null;
  avatarUrl: string | null;
};

type AvatarPhotoFieldProps = {
  formRef: React.RefObject<HTMLFormElement | null>;
};

function AvatarPhotoField({ formRef }: AvatarPhotoFieldProps) {
  const { pending } = useFormStatus();

  return (
    <PhotoFileField
      id="avatar"
      name="avatar"
      label="Profile photo"
      formRef={formRef}
      autoSubmitOnSelect
      pending={pending}
      buttonLabel="Upload photo"
      buttonLabelPending="Uploading…"
    />
  );
}

export function AvatarUploadForm({ name, avatarUrl }: AvatarUploadFormProps) {
  const [state, formAction] = useActionState(uploadAvatarAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useActionStateToast(state, {
    errorTitle: "Upload failed",
    successTitle: "Image uploaded successfully",
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <ProfileAvatar name={name} avatarUrl={avatarUrl} size="lg" />
      <form ref={formRef} action={formAction} className="w-full">
        <AvatarPhotoField formRef={formRef} />
      </form>
    </div>
  );
}
