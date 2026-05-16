"use server";

import { redirect } from "next/navigation";

import { DEFAULT_LOGIN_PATH } from "@/lib/auth/config";
import { signOut } from "@/lib/auth/server";

export async function signOutAction() {
  await signOut();
  redirect(DEFAULT_LOGIN_PATH);
}
