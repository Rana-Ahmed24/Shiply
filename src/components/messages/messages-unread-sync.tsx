"use client";

import { useEffect } from "react";

import { dispatchMessagesUnreadChanged } from "@/lib/messages/unread-events";

/** Refreshes navbar unread badge after server-side mark-as-read on chat pages. */
export function MessagesUnreadSync() {
  useEffect(() => {
    dispatchMessagesUnreadChanged();
  }, []);

  return null;
}
