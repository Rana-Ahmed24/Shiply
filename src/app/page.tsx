import { redirect } from "next/navigation";

import { HeroSection } from "@/components/marketing/hero-section";
import { LiveListings } from "@/components/marketing/live-listings";
import { TrustBar } from "@/components/marketing/trust-bar";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/auth/config";
import { needsOnboarding } from "@/lib/auth/profile";
import { getSession } from "@/lib/auth/server";

/** Public marketing landing — signed-in users go to the app home feed. */
export default async function LandingPage() {
  const session = await getSession();

  if (session && !needsOnboarding(session.user, session.profile)) {
    redirect(DEFAULT_AUTH_REDIRECT);
  }

  return (
    <>
      <HeroSection listings={<LiveListings />} />
      <TrustBar />
    </>
  );
}
