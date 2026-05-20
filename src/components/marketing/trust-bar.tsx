import {
  BadgeCheck,
  FileCheck,
  Shield,
  Star,
  Wallet,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { TRUST_FEATURES } from "@/lib/constants";

const TRUST_ICONS = [BadgeCheck, Wallet, Shield, Star, FileCheck] as const;

export function TrustBar() {
  return (
    <section className="border-y border-border/60 bg-secondary py-5">
      <Container>
        <ul className="flex flex-wrap items-center justify-around gap-4">
          {TRUST_FEATURES.map((feature, index) => {
            const Icon = TRUST_ICONS[index] ?? Shield;
            return (
              <li
                key={feature}
                className="flex items-center gap-2 text-sm text-brand-muted"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-gold/10 text-brand-gold">
                  <Icon className="size-3.5" aria-hidden />
                </span>
                {feature}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
