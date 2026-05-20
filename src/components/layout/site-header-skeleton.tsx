import { Container } from "@/components/layout/container";

/** Placeholder header shell to avoid layout shift while auth nav loads. */
export function SiteHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-xl">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="h-7 w-24 animate-pulse rounded-lg bg-muted" aria-hidden />
          <div className="hidden flex-1 justify-center gap-6 md:flex" aria-hidden>
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="flex items-center gap-2" aria-hidden>
            <div className="size-9 animate-pulse rounded-2xl bg-muted" />
            <div className="size-9 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </Container>
    </header>
  );
}
