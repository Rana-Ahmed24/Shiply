import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";
import { getPublicSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  const { url, anonKey } = getPublicSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}

/** Returns null when public env vars are missing (avoids crashing optional realtime UI). */
export function createClientIfConfigured() {
  if (!hasSupabaseEnv()) return null;
  const { url, anonKey } = getPublicSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
