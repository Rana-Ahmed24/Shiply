"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { requireUser } from "@/lib/auth/server";
import { MODE_COOKIE, type AppMode } from "@/lib/mode/constants";
import { createClient } from "@/lib/supabase/server";

export async function setAppModeAction(mode: AppMode) {
  const user = await requireUser();
  const cookieStore = await cookies();

  cookieStore.set(MODE_COOKIE, mode, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ preferred_mode: mode })
    .eq("id", user.id);

  if (error && !error.message.includes("preferred_mode")) {
    console.error("[mode] setAppModeAction profile update:", error.message);
  }

  revalidatePath("/", "layout");
  revalidatePath("/home");
}
