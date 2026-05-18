import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth/server";

export default async function ProfileHubPage() {
  const { user } = await requireSession(
    `/login?redirectTo=${encodeURIComponent("/profile")}`
  );

  redirect(`/profile/${user.id}`);
}
