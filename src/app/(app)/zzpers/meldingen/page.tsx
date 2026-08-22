import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { NotificationList } from "@/components/notification-list";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { listNotifications } from "@/server/notifications/service";

export const metadata: Metadata = {
  title: "Meldingen",
  robots: { index: false },
};

export default async function ZzpMeldingenPage() {
  const user = await requireCurrentUser();
  const notifications = await listNotifications(user.id);
  return (
    <Container className="max-w-2xl py-8 md:py-12">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">Meldingen</h1>
      <NotificationList
        notifications={notifications}
        basePath="/zzpers/meldingen"
      />
    </Container>
  );
}
