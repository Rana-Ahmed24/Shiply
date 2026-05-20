"use client";

import { ImagePlus, Send } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  sendChatImageAction,
  sendChatMessageAction,
} from "@/lib/messages/actions";
import { ALLOWED_CHAT_IMAGE_TYPES } from "@/lib/messages/constants";
import { cn } from "@/lib/utils";

type ChatComposerProps = {
  matchId: string;
  disabled?: boolean;
  onTyping?: () => void;
  onSent?: () => void;
  className?: string;
};

export function ChatComposer({
  matchId,
  disabled,
  onTyping,
  onSent,
  className,
}: ChatComposerProps) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || sending || disabled) return;

    setSending(true);
    setError(null);
    const result = await sendChatMessageAction(matchId, text);
    setSending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setBody("");
    onSent?.();
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || sending || disabled) return;

    setSending(true);
    setError(null);
    const formData = new FormData();
    formData.set("image", file);
    const result = await sendChatImageAction(matchId, formData);
    setSending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onSent?.();
  }

  return (
    <div
      className={cn(
        "border-t border-border/50 bg-card px-3 py-3 backdrop-blur-sm pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className
      )}
    >
      {error ? (
        <p className="mb-2 px-1 text-xs text-destructive">{error}</p>
      ) : null}
      <form onSubmit={handleSend} className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={ALLOWED_CHAT_IMAGE_TYPES.join(",")}
          className="sr-only"
          onChange={handleImageChange}
          disabled={sending || disabled}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
          disabled={sending || disabled}
          onClick={() => fileRef.current?.click()}
          aria-label="Attach image"
        >
          <ImagePlus className="size-5" />
        </Button>
        <textarea
          rows={1}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            onTyping?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend(e);
            }
          }}
          placeholder="Message…"
          disabled={sending || disabled}
          maxLength={2000}
          className="max-h-28 min-h-[2.5rem] flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-sm leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40"
        />
        <Button
          type="submit"
          size="icon"
          disabled={sending || disabled || !body.trim()}
          className="shrink-0 rounded-xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
          aria-label="Send message"
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
