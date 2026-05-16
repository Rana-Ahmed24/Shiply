"use client";

import { motion } from "framer-motion";

import { TravelerListingCard } from "@/components/marketing/traveler-listing-card";
import { LIVE_LISTINGS } from "@/data/mock-listings";

export function LiveListings() {
  return (
    <section aria-labelledby="live-listings-heading">
      <p
        id="live-listings-heading"
        className="mb-4 flex items-center gap-2 text-sm font-medium text-brand-teal"
      >
        <span className="size-1.5 rounded-full bg-brand-teal" aria-hidden />
        Live traveler listings
      </p>
      <div className="space-y-4">
        {LIVE_LISTINGS.map((listing, index) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <TravelerListingCard listing={listing} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
