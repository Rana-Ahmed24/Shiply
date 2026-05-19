import "server-only";

import { CHAT_IMAGES_BUCKET, MAX_CHAT_IMAGE_BYTES } from "@/lib/messages/constants";
import { getChatImagePublicUrl } from "@/lib/messages/urls";
import { createClient } from "@/lib/supabase/server";

export { getChatImagePublicUrl };

export async function uploadChatImage(
  matchId: string,
  userId: string,
  file: File
): Promise<{ path: string; url: string } | { error: string }> {
  if (file.size > MAX_CHAT_IMAGE_BYTES) {
    return { error: "Image must be under 5 MB." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${matchId}/${crypto.randomUUID()}.${ext}`;

  const supabase = await createClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(CHAT_IMAGES_BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return { error: error.message };
  }

  return { path, url: getChatImagePublicUrl(path) };
}
