import { BadgeCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { VERIFICATION_LABELS } from "@/lib/profile/constants";
import type { ProfileVerification } from "@/types/profile";

type ProfileVerificationBadgesProps = {
  verifications: ProfileVerification[];
};

export function ProfileVerificationBadges({
  verifications,
}: ProfileVerificationBadgesProps) {
  if (!verifications.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No verifications yet
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {verifications.map((v) => (
        <li key={v.type}>
          <Badge
            variant="outline"
            className="gap-1 rounded-full border-brand-teal/30 bg-brand-teal/10 text-brand-teal"
          >
            <BadgeCheck className="size-3.5" aria-hidden />
            {VERIFICATION_LABELS[v.type] ?? v.type}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
