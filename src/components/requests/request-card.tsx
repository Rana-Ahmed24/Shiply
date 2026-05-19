import Image from "next/image";
import Link from "next/link";

import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { Badge } from "@/components/ui/badge";
import type { RequestCardModel } from "@/types/request";
import { cn } from "@/lib/utils";

type RequestCardProps = {
  request: RequestCardModel;
  className?: string;
};

export function RequestCard({ request, className }: RequestCardProps) {
  return (
    <Link
      href={request.href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition-shadow hover:border-brand-gold/30 hover:shadow-soft-lg",
        className
      )}
    >
      {request.imageUrl ? (
        <div className="relative aspect-[16/10] w-full bg-muted">
          <Image
            src={request.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-muted/50 text-xs text-muted-foreground">
          No image
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-brand-gold">
            {request.title}
          </h3>
          <RequestStatusBadge
            lifecycle={request.lifecycle}
            label={request.lifecycleLabel}
          />
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {request.descriptionPreview}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary" className="rounded-full">
            {request.category}
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {request.urgencyLabel}
          </Badge>
          {request.neededBy && (
            <Badge variant="outline" className="rounded-full">
              Need by {request.neededBy}
            </Badge>
          )}
          {request.budgetLabel && (
            <span className="font-medium text-brand-gold">
              {request.budgetLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
