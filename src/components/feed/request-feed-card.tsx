import Image from "next/image";
import Link from "next/link";
import { MapPin, Package } from "lucide-react";

import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { OwnershipDisabledCta } from "@/components/ui/ownership-disabled-cta";
import type { RequestCardModel } from "@/types/request";
import { cn } from "@/lib/utils";

type RequestFeedCardProps = {
  request: RequestCardModel;
  currentUserId?: string | null;
  className?: string;
};

export function RequestFeedCard({
  request,
  currentUserId,
  className,
}: RequestFeedCardProps) {
  const isOwner = Boolean(currentUserId && request.customerId === currentUserId);

  return (
    <article className={cn("feed-card flex flex-col overflow-hidden p-0", className)}>
      {request.imageUrl ? (
        <div className="relative aspect-[16/9] w-full bg-muted">
          <Image
            src={request.imageUrl}
            alt={request.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-muted text-brand-muted">
          <Package className="size-8 opacity-40" aria-hidden />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug">
            {request.title}
          </h3>
          <RequestStatusBadge
            lifecycle={request.lifecycle}
            label={request.lifecycleLabel}
          />
        </div>

        <div className="mb-3 flex items-center gap-2 text-sm text-brand-muted">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span>
            <span className="font-medium text-foreground">{request.pickupLabel}</span>
            <span className="mx-1.5">→</span>
            {request.destinationLabel}
          </span>
        </div>

        <p className="mb-3 line-clamp-2 text-sm font-light text-brand-muted">
          {request.descriptionPreview}
        </p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          <span className="shiply-tag">{request.category}</span>
          {request.packageSizeLabel && (
            <span className="shiply-tag">{request.packageSizeLabel}</span>
          )}
          {request.neededBy && (
            <span className="shiply-tag">Need by {request.neededBy}</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3.5">
          {request.budgetLabel ? (
            <span className="text-lg font-semibold text-brand-gold">
              {request.budgetLabel}
            </span>
          ) : (
            <span className="text-sm text-brand-muted">Budget negotiable</span>
          )}
          {isOwner ? (
            <OwnershipDisabledCta
              label="Your request"
              tooltip="You cannot send an offer on your own request"
              block={false}
            />
          ) : (
            <Link
              href={request.href}
              className={cn(
                buttonVariants({ size: "sm" }),
                "rounded-lg bg-brand-gold px-4 text-xs font-medium text-brand-navy hover:bg-brand-gold-light"
              )}
            >
              View request
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
