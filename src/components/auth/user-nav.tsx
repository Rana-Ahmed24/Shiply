"use client";

import { LayoutDashboard, LogOut, Settings } from "lucide-react";
import Link from "next/link";

import { signOutAction } from "@/lib/auth/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type UserNavProps = {
  userId: string;
  email: string;
  fullName?: string | null;
  roles?: string[];
};

export function UserNav({ userId, email, fullName, roles }: UserNavProps) {
  const initials = (fullName ?? email).slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex size-9 items-center justify-center rounded-2xl border border-border/60 bg-card text-xs font-semibold text-foreground outline-none",
          "hover:border-brand-gold/40 focus-visible:ring-3 focus-visible:ring-ring/50"
        )}
        aria-label="Account menu"
      >
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl">
        <DropdownMenuLabel className="font-normal">
          <p className="font-medium">{fullName ?? "Account"}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
          {roles && roles.length > 0 && (
            <p className="mt-1 text-xs capitalize text-brand-teal">
              {roles.join(" · ")}
            </p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard" />}>
          <LayoutDashboard className="size-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={`/profile/${userId}`} />}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />}>
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOutAction()}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
