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
    <section className="border-t border-border/60 bg-secondary py-8">
      <Container>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {TRUST_FEATURES.map((feature, index) => {
            const Icon = TRUST_ICONS[index] ?? Shield;
            return (
              <li
                key={feature}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
                  <Icon className="size-4" aria-hidden />
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
