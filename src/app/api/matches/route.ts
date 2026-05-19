import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/matching/api";
import { getMatchesForUser } from "@/lib/matching/queries";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const matches = await getMatchesForUser(auth.user.id);
  return NextResponse.json({ matches });
}
