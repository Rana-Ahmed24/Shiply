import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/server";
import { getUnreadNotificationCount } from "@/lib/notifications/queries";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ count: 0 });
  }

  const count = await getUnreadNotificationCount(session.user.id);
  return NextResponse.json({ count });
}
