import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/matching/api";
import { getMatchesFeed } from "@/lib/matching/queries";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const feed = await getMatchesFeed(auth.user.id);
  return NextResponse.json(feed);
}
