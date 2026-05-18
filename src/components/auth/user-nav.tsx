"use client";

import { LayoutDashboard, LogOut, Settings } from "lucide-react";
import Link from "next/link";

import { signOutAction } from "@/lib/auth/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppMode } from "@/lib/mode/client-store";
import type { AppMode } from "@/lib/mode/constants";
import { MODE_SHORT } from "@/lib/mode/constants";
import { cn } from "@/lib/utils";

type UserNavProps = {
  userId: string;
  email: string;
  fullName?: string | null;
  appMode: AppMode;
};

export function UserNav({ userId, email, fullName, appMode }: UserNavProps) {
  const mode = useAppMode(appMode);
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
          <p className="mt-1 text-xs font-medium capitalize text-brand-teal">
            {MODE_SHORT[mode]}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/home" />}>
            <LayoutDashboard className="size-4" />
            Home
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/profile/${userId}`} />}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/settings" />}>
            <Settings className="size-4" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => signOutAction()}
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
