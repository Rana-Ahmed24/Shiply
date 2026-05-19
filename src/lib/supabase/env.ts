/**
 * Public Supabase env — must use static `process.env.NEXT_PUBLIC_*` access so
 * Next.js can inline values in the browser bundle (dynamic `process.env[name]` is undefined client-side).
 */
function publicUrl(): string | undefined {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return value && value.length > 0 ? value : undefined;
}

function publicAnonKey(): string | undefined {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function hasSupabaseEnv(): boolean {
  return Boolean(publicUrl() && publicAnonKey());
}

export function getPublicSupabaseEnv() {
  const url = publicUrl();
  const anonKey = publicAnonKey();

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copy .env.example to .env.local and add your project credentials, then restart the dev server."
    );
  }

  return { url, anonKey };
}

export function getServiceRoleKey(): string {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!value) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Required for server-only admin operations."
    );
  }
  return value;
}

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
