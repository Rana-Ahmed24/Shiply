import { MessageSquare } from "lucide-react";
import Link from "next/link";

import { UserNav } from "@/components/auth/user-nav";
import { MessagesNavLink } from "@/components/navigation/messages-nav-link";
import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { getTotalUnreadMessageCount } from "@/lib/messages/queries";
import { AppModeHydrator } from "@/components/mode/app-mode-hydrator";
import { buttonVariants } from "@/components/ui/button";
import { AUTH_NAV_LINKS, NAV_LINKS } from "@/lib/constants";
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

  const unreadMessages = session
    ? await getTotalUnreadMessageCount(session.user.id)
    : 0;

  const signedInActions = session ? (
    <>
      <MessagesNavLink unreadCount={unreadMessages} className="hidden sm:inline-flex" />
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
          "relative w-full rounded-2xl justify-center gap-2"
        )}
      >
        <MessageSquare className="size-4" aria-hidden />
        Messages
        {unreadMessages > 0 ? (
          <span className="ml-1 rounded-full bg-brand-teal px-2 py-0.5 text-xs font-semibold text-white">
            {unreadMessages > 99 ? "99+" : unreadMessages}
          </span>
        ) : null}
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
