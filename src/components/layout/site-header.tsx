import { MessageSquare } from "lucide-react";
import Link from "next/link";

import { UserNav } from "@/components/auth/user-nav";
import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { MessagesNavLink } from "@/components/navigation/messages-nav-link";
import { AppModeHydrator } from "@/components/mode/app-mode-hydrator";
import { buttonVariants } from "@/components/ui/button";
import { AUTH_NAV_LINKS, NAV_LINKS } from "@/lib/constants";
import type { AuthSession } from "@/lib/auth/session";
import type { AppMode } from "@/lib/mode/constants";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  session: AuthSession | null;
  mode: AppMode | null;
};

/** Sync header shell — session/mode resolved in MainLayout to avoid suspend/hydration gaps. */
export function SiteHeader({ session, mode }: SiteHeaderProps) {
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

  const signedInActions = session ? (
    <>
      <MessagesNavLink className="hidden sm:inline-flex" />
      <UserNav
        userId={session.user.id}
        email={session.user.email ?? ""}
        fullName={session.profile?.full_name}
        roles={session.profile?.roles}
      />
    </>
  ) : null;

  const signedInMobileActions = session ? (
    <>
      <Link
        href="/messages"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "relative w-full justify-center gap-2 rounded-2xl"
        )}
      >
        <MessageSquare className="size-4" aria-hidden />
        Messages
      </Link>
      <UserNav
        userId={session.user.id}
        email={session.user.email ?? ""}
        fullName={session.profile?.full_name}
        roles={session.profile?.roles}
      />
    </>
  ) : null;

  return (
    <>
      {session && mode ? <AppModeHydrator mode={mode} /> : null}
      <SiteHeaderClient
        logoHref="/"
        desktopAuth={session ? signedInActions : loggedOutDesktop}
        mobileAuth={session ? signedInMobileActions : loggedOutMobile}
        navLinks={session ? AUTH_NAV_LINKS : NAV_LINKS}
      />
    </>
  );
}
