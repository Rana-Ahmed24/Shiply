import { cn } from "@/lib/utils";

type AuthAlertProps = {
  variant?: "error" | "success";
  children: React.ReactNode;
};

export function AuthAlert({ variant = "error", children }: AuthAlertProps) {
  return (
    <p
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        variant === "error" &&
          "border-destructive/30 bg-destructive/10 text-destructive",
        variant === "success" &&
          "border-brand-teal/30 bg-brand-teal/10 text-brand-teal"
      )}
    >
      {children}
    </p>
  );
}
