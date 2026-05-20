import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/server";
import { getTotalUnreadMessageCount } from "@/lib/messages/queries";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ count: 0 });
  }

  const count = await getTotalUnreadMessageCount(session.user.id);
  return NextResponse.json({ count });
}
