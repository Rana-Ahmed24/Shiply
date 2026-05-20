/** Fired when read state or unread counts may have changed (navbar badge, inbox). */
export const MESSAGES_UNREAD_CHANGED_EVENT = "messages-unread-changed";

export function dispatchMessagesUnreadChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MESSAGES_UNREAD_CHANGED_EVENT));
}
