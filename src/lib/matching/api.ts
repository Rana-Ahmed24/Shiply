import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/server";

export async function requireApiUser() {
  const session = await getSession();
  if (!session?.user) {
    return {
      user: null as null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user: session.user, response: null as null };
}
