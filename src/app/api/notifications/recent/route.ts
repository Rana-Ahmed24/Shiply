import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/server";
import { payloadFromAppNotification } from "@/lib/notifications/realtime-payload";
import { getRecentNotifications } from "@/lib/notifications/queries";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ items: [] });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    Number(searchParams.get("limit") ?? "12") || 12,
    30
  );

  const items = await getRecentNotifications(session.user.id, limit);
  return NextResponse.json({
    items: items.map(payloadFromAppNotification),
  });
}
