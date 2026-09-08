import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AssistantWidget } from "@/components/ai/assistant-widget";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <>
      <SiteHeader
        user={user ? { email: user.email, role: user.role } : null}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <AssistantWidget />
    </>
  );
}
