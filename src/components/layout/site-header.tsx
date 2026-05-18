import Link from "next/link";

import { UserNav } from "@/components/auth/user-nav";
import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { AppModeHydrator } from "@/components/mode/app-mode-hydrator";
import { ModeToggle } from "@/components/mode/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth/server";
import type { AppMode } from "@/lib/mode/constants";
import { getAppMode } from "@/lib/mode/server";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  const session = await getSession();
  const mode = session
    ? await getAppMode(
        (session.profile?.preferred_mode as AppMode | undefined) ?? "customer"
      )
    : null;

  const loggedOutDesktop = (
    <>
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "rounded-2xl"
        )}
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className={cn(
          buttonVariants({ size: "sm" }),
          "rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
        )}
      >
        Get started
      </Link>
    </>
  );

  const loggedOutMobile = (
    <>
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full rounded-2xl"
        )}
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className={cn(
          buttonVariants(),
          "w-full rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
        )}
      >
        Get started
      </Link>
    </>
  );

  const userNav =
    session && mode ? (
      <UserNav
        userId={session.user.id}
        email={session.user.email ?? ""}
        fullName={session.profile?.full_name}
        appMode={mode}
      />
    ) : null;

  const modeToggle = session ? (
    <ModeToggle mode={mode!} />
  ) : null;

  return (
    <>
      {session && mode ? <AppModeHydrator mode={mode} /> : null}
      <SiteHeaderClient
        logoHref={session ? "/home" : "/"}
        desktopAuth={session ? userNav : loggedOutDesktop}
        mobileAuth={session ? userNav : loggedOutMobile}
        modeToggle={modeToggle}
      />
    </>
  );
}
