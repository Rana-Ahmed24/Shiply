"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClientIfConfigured } from "@/lib/supabase/client";
import type { MatchMessage } from "@/lib/messages/queries";
import { cn } from "@/lib/utils";

type MatchChatProps = {
  matchId: string;
  userId: string;
  initialMessages: MatchMessage[];
};

export function MatchChat({
  matchId,
  userId,
  initialMessages,
}: MatchChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const supabase = createClientIfConfigured();
    if (!supabase) return;

    const channel = supabase
      .channel(`messages-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            body: string;
            sender_id: string;
            is_system: boolean;
            created_at: string;
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [
              ...prev,
              {
                id: row.id,
                body: row.body,
                senderId: row.sender_id,
                isSystem: row.is_system,
                createdAt: row.created_at,
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [matchId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || sending) return;

    setSending(true);
    const supabase = createClientIfConfigured();
    if (!supabase) {
      setSending(false);
      return;
    }
    const { error } = await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: userId,
      body: text,
    });

    if (!error) {
      setBody("");
    }
    setSending(false);
  }

  return (
    <div className="flex min-h-[24rem] flex-col rounded-2xl border border-border/60 bg-card shadow-soft">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No messages yet. Say hello to coordinate delivery.
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                msg.isSystem
                  ? "mx-auto bg-muted/50 text-center text-muted-foreground"
                  : msg.senderId === userId
                    ? "ml-auto bg-brand-gold/20 text-foreground"
                    : "bg-muted text-foreground"
              )}
            >
              {msg.body}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="flex gap-2 border-t border-border/50 p-4"
      >
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm"
          maxLength={2000}
        />
        <Button
          type="submit"
          disabled={sending || !body.trim()}
          className="rounded-xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
        >
          Send
        </Button>
      </form>
    </div>
  );
}
