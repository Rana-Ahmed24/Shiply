import Image from "next/image";
import Link from "next/link";

import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { RequestCardModel } from "@/types/request";
import { cn } from "@/lib/utils";

type RequestBrowseCardProps = {
  request: RequestCardModel;
  className?: string;
};

export function RequestBrowseCard({ request, className }: RequestBrowseCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft",
        className
      )}
    >
      {request.imageUrl ? (
        <div className="relative aspect-[16/10] w-full bg-muted">
          <Image
            src={request.imageUrl}
            alt={request.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-muted/50 text-xs text-muted-foreground">
          Package photo
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold leading-snug">{request.title}</h3>
          <RequestStatusBadge
            lifecycle={request.lifecycle}
            label={request.lifecycleLabel}
          />
        </div>

        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{request.pickupLabel}</span>
          <span className="mx-1.5">→</span>
          <span>{request.destinationLabel}</span>
        </p>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {request.descriptionPreview}
        </p>

        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary" className="rounded-full">
            {request.category}
          </Badge>
          {request.packageSizeLabel && (
            <Badge variant="outline" className="rounded-full">
              {request.packageSizeLabel}
            </Badge>
          )}
          {request.neededBy && (
            <Badge variant="outline" className="rounded-full">
              Need by {request.neededBy}
            </Badge>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          {request.budgetLabel ? (
            <span className="text-lg font-semibold text-brand-gold">
              {request.budgetLabel}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Budget negotiable</span>
          )}
          <Link
            href={request.href}
            className={cn(
              buttonVariants({ size: "sm" }),
              "rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
            )}
          >
            Accept request
          </Link>
        </div>
      </div>
    </article>
  );
}
