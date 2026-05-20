"use client";

import { useEffect } from "react";

/** Keeps the document at the top when opening a chat (avoids jumping to the composer). */
export function ChatWindowScroll() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return null;
}
