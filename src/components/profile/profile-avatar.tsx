import Image from "next/image";

import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  name: string | null;
  avatarUrl: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: "size-12 text-sm",
  md: "size-20 text-xl",
  lg: "size-28 text-3xl",
} as const;

export function ProfileAvatar({
  name,
  avatarUrl,
  size = "md",
  className,
}: ProfileAvatarProps) {
  const initials = (name ?? "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (avatarUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-2xl border border-border/60 shadow-soft",
          SIZES[size],
          className
        )}
      >
        <Image
          src={avatarUrl}
          alt={name ?? "Profile"}
          fill
          className="object-cover"
          sizes={size === "lg" ? "112px" : size === "md" ? "80px" : "48px"}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-brand-gold/15 font-semibold text-brand-gold shadow-soft",
        SIZES[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
