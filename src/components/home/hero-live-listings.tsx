import { HeroListingsPanel } from "@/components/home/hero-listings-panel";
import { getHeroListingPreviews } from "@/lib/listings/hero-listings";

export async function HeroLiveListings() {
  const listings = await getHeroListingPreviews(3);
  return <HeroListingsPanel listings={listings} />;
}
