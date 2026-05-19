"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/server";
import { notifyNewMessage } from "@/lib/messages/notifications";
import {
  getConversationMeta,
  markMatchMessagesRead,
} from "@/lib/messages/queries";
import { uploadChatImage } from "@/lib/messages/storage";
import { createClient } from "@/lib/supabase/server";

async function assertCanChat(matchId: string, userId: string) {
  const meta = await getConversationMeta(matchId, userId);
  if (!meta) {
    throw new Error("You can only message on accepted delivery matches.");
  }
  return meta;
}

async function notifyRecipient(
  matchId: string,
  senderId: string,
  preview: string
) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", senderId)
    .maybeSingle();

  const meta = await getConversationMeta(matchId, senderId);
  if (!meta) return;

  await notifyNewMessage({
    recipientId: meta.counterpartyId,
    senderName: (profile?.full_name as string) || "Someone",
    matchId,
    preview,
  });
}

export async function sendChatMessageAction(
  matchId: string,
  body: string
): Promise<{ error?: string }> {
  const user = await requireUser();
  const text = body.trim();
  if (!text) return { error: "Message cannot be empty." };

  try {
    await assertCanChat(matchId, user.id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Cannot send message." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    match_id: matchId,
    sender_id: user.id,
    body: text,
  });

  if (error) {
    return { error: error.message };
  }

  await notifyRecipient(matchId, user.id, text);

  revalidatePath("/messages");
  revalidatePath(`/messages/${matchId}`);
  return {};
}

export async function sendChatImageAction(
  matchId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const user = await requireUser();
  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to send." };
  }

  try {
    await assertCanChat(matchId, user.id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Cannot send image." };
  }

  const uploaded = await uploadChatImage(matchId, user.id, file);
  if ("error" in uploaded) {
    return { error: uploaded.error };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    match_id: matchId,
    sender_id: user.id,
    body: "",
    attachment_paths: [uploaded.path],
  });

  if (error) {
    return { error: error.message };
  }

  await notifyRecipient(matchId, user.id, "📷 Photo");

  revalidatePath("/messages");
  revalidatePath(`/messages/${matchId}`);
  return {};
}

export async function markChatReadAction(matchId: string): Promise<void> {
  const user = await requireUser();
  await markMatchMessagesRead(matchId, user.id);
  revalidatePath("/messages");
  revalidatePath(`/messages/${matchId}`);
}
