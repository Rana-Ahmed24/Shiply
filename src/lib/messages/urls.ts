import { CHAT_IMAGES_BUCKET } from "@/lib/messages/constants";

export function getChatImagePublicUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!supabaseUrl) return path;
  if (path.startsWith("http")) return path;
  return `${supabaseUrl}/storage/v1/object/public/${CHAT_IMAGES_BUCKET}/${path}`;
}
