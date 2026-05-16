const PUBLIC_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function hasSupabaseEnv(): boolean {
  return Boolean(
    readEnv("NEXT_PUBLIC_SUPABASE_URL") && readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

export function getPublicSupabaseEnv() {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !anonKey) {
    throw new Error(
      `Missing Supabase environment variables: ${PUBLIC_KEYS.join(", ")}. ` +
        "Copy .env.example to .env.local and add your project credentials."
    );
  }

  return { url, anonKey };
}

export function getServiceRoleKey(): string {
  const key = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Required for server-only admin operations."
    );
  }

  return key;
}

export function getSiteUrl(): string {
  return (
    readEnv("NEXT_PUBLIC_SITE_URL") ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
}
