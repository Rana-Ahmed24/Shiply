import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/server";
import { getReadReceiptsForMatch } from "@/lib/messages/queries";

type RouteContext = { params: Promise<{ matchId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matchId } = await context.params;
  const readMessageIds = await getReadReceiptsForMatch(
    matchId,
    session.user.id
  );

  return NextResponse.json({ readMessageIds });
}
