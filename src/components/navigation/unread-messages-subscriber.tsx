"use client";

import { useUnreadMessagesSubscription } from "@/hooks/use-unread-messages-subscription";

type UnreadMessagesSubscriberProps = {
  userId: string;
};

export function UnreadMessagesSubscriber({ userId }: UnreadMessagesSubscriberProps) {
  useUnreadMessagesSubscription(userId);
  return null;
}
