/** Fired when notification read state or unread count may have changed. */
export const NOTIFICATIONS_CHANGED_EVENT = "notifications-changed";

export function dispatchNotificationsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT));
}
