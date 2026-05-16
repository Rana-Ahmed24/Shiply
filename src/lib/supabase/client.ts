import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";
import { getPublicSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
    );
  }

  const { url, anonKey } = getPublicSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
