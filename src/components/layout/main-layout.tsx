import { Suspense } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteHeaderSkeleton } from "@/components/layout/site-header-skeleton";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { getSession } from "@/lib/auth/server";
import type { AppMode } from "@/lib/mode/constants";
import { getAppMode } from "@/lib/mode/server";
import { cn } from "@/lib/utils";

type MainLayoutProps = {
  children: React.ReactNode;
};

async function HeaderWithSession() {
  const session = await getSession();
  const mode = session
    ? await getAppMode(
        (session.profile?.preferred_mode as AppMode | undefined) ?? "customer"
      )
    : null;

  return <SiteHeader session={session} mode={mode} />;
}

export async function MainLayout({ children }: MainLayoutProps) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<SiteHeaderSkeleton />}>
        <HeaderWithSession />
      </Suspense>
      <main className={cn("flex-1", session && "pb-20 md:pb-0")}>
        {children}
      </main>
      <SiteFooter />
      {session ? <BottomNav /> : null}
    </div>
  );
}
