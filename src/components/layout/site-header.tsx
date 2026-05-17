import Link from "next/link";

import { UserNav } from "@/components/auth/user-nav";
import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth/server";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  const session = await getSession();

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

  const loggedIn = session ? (
    <UserNav
      email={session.user.email ?? ""}
      fullName={session.profile?.full_name}
      roles={session.profile?.roles}
    />
  ) : null;

  return (
    <SiteHeaderClient
      desktopAuth={session ? loggedIn : loggedOutDesktop}
      mobileAuth={session ? loggedIn : loggedOutMobile}
    />
  );
}
