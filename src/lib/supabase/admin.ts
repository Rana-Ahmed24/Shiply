import { createClient } from "@supabase/supabase-js";
import "server-only";

import type { Database } from "@/types/database";
import { getPublicSupabaseEnv, getServiceRoleKey } from "@/lib/supabase/env";

/**
 * Service-role client — bypasses RLS. Use only in Route Handlers,
 * Server Actions, and background jobs. Never import in Client Components.
 */
export function createAdminClient() {
  const { url } = getPublicSupabaseEnv();

  return createClient<Database>(url, getServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
