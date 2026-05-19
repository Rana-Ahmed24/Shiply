import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/matching/api";
import { getMatchById } from "@/lib/matching/queries";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const match = await getMatchById(id, auth.user.id);

  if (!match) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ match });
}
