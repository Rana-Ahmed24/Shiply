"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Logo } from "@/components/ui/logo";

type AuthShellProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
};

export function AuthShell({ children, title, description }: AuthShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-12 sm:py-16"
    >
      <div className="space-y-2 text-center">
        <Link href="/" className="inline-flex justify-center">
          <Logo />
        </Link>
        <h1 className="text-display text-2xl sm:text-3xl">{title}</h1>
        {description ? (
          <p className="text-lead text-sm sm:text-base">{description}</p>
        ) : null}
      </div>
      {children}
    </motion.div>
  );
}
