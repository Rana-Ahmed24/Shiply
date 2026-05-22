import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

type ReviewStarsProps = {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
};

export function ReviewStars({
  rating,
  max = 5,
  size = "sm",
  className,
}: ReviewStarsProps) {
  const iconClass = size === "md" ? "size-5" : "size-4";

  return (
    <div
      className={cn("flex items-center gap-0.5 text-brand-gold", className)}
      aria-label={`${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <Star
            key={i}
            className={cn(iconClass, filled ? "fill-current" : "opacity-30")}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

type ReviewStarInputProps = {
  name: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function ReviewStarInput({
  name,
  value,
  onChange,
  disabled,
}: ReviewStarInputProps) {
  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={value} />
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            className={cn(
              "rounded-lg p-1 transition-colors",
              "text-brand-gold hover:bg-brand-gold/10",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
          >
            <Star
              className={cn(
                "size-8",
                active ? "fill-current" : "opacity-30"
              )}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
