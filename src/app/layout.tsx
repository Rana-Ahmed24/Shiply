import type { Metadata } from "next";

import { MainLayout } from "@/components/layout/main-layout";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { SITE } from "@/lib/constants";
import { fontSans } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: SITE.fullName,
    template: `%s | ${SITE.fullName}`,
  },
  description: SITE.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <ToastProvider>
            <MainLayout>{children}</MainLayout>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
