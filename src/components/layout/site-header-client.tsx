"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SiteHeaderClientProps = {
  logoHref?: string;
  desktopAuth: React.ReactNode;
  mobileAuth: React.ReactNode;
  modeToggle?: React.ReactNode;
};

export function SiteHeaderClient({
  logoHref = "/",
  desktopAuth,
  mobileAuth,
  modeToggle,
}: SiteHeaderClientProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Logo href={logoHref} />

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {modeToggle}
            <ThemeToggle />
            <div className="hidden sm:block">{desktopAuth}</div>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "rounded-2xl md:hidden"
                )}
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm">
                <SheetHeader>
                  <SheetTitle>
                    <Logo href={logoHref} linked={false} />
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-4" aria-label="Mobile">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-8 flex flex-col gap-3">{mobileAuth}</div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
    </header>
  );
}
