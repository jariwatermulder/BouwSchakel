import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ConversationList } from "@/components/conversation-list";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { listConversationsForUser } from "@/server/messaging/service";

export const metadata: Metadata = {
  title: "Berichten",
  robots: { index: false },
};

export default async function ZzpBerichtenPage() {
  const user = await requireCurrentUser();
  const conversations = await listConversationsForUser(user.id);
  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Berichten</h1>
      <div className="mt-6">
        <ConversationList
          conversations={conversations}
          perspectief="zzp"
          basePath="/zzpers/berichten"
        />
      </div>
    </Container>
  );
}
