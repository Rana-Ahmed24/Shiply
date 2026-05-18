import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { getSession } from "@/lib/auth/server";
import { cn } from "@/lib/utils";

type MainLayoutProps = {
  children: React.ReactNode;
};

export async function MainLayout({ children }: MainLayoutProps) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className={cn("flex-1", session && "pb-20 md:pb-0")}>
        {children}
      </main>
      <SiteFooter />
      {session ? <BottomNav /> : null}
    </div>
  );
}
