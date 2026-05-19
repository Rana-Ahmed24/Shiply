"use client";

import Image from "next/image";

import { formatMessageTime } from "@/lib/messages/mappers";
import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.isSystem) {
    return (
      <p className="py-2 text-center text-xs text-muted-foreground">{message.body}</p>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        message.isOwn ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "max-w-[min(85%,20rem)] overflow-hidden rounded-2xl px-3.5 py-2.5 shadow-sm",
          message.isOwn
            ? "rounded-br-md bg-brand-gold text-brand-navy"
            : "rounded-bl-md bg-muted text-foreground"
        )}
      >
        {message.attachmentUrls.length > 0 && (
          <div className="space-y-2">
            {message.attachmentUrls.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-xl"
              >
                <div className="relative aspect-[4/3] min-w-[12rem] max-w-full">
                  <Image
                    src={url}
                    alt="Shared image"
                    fill
                    className="object-cover"
                    sizes="280px"
                  />
                </div>
              </a>
            ))}
          </div>
        )}
        {message.body.trim() ? (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.body}
          </p>
        ) : null}
      </div>
      <div
        className={cn(
          "flex items-center gap-1.5 px-1 text-[0.65rem] text-muted-foreground",
          message.isOwn && "flex-row-reverse"
        )}
      >
        <span>{formatMessageTime(message.createdAt)}</span>
        {message.isOwn && message.readByOther && (
          <span className="text-brand-teal">Read</span>
        )}
      </div>
    </div>
  );
}

