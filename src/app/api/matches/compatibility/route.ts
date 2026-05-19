import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/matching/api";
import { getCompatibilityForPair } from "@/lib/matching/queries";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId");
  const requestId = searchParams.get("requestId");

  if (!listingId || !requestId) {
    return NextResponse.json(
      { error: "listingId and requestId are required" },
      { status: 400 }
    );
  }

  const compatibility = await getCompatibilityForPair(listingId, requestId);
  if (!compatibility) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ compatibility });
}
