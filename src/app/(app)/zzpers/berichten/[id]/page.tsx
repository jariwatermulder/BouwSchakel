import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ConversationView } from "@/components/conversation-view";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getConversation } from "@/server/messaging/service";

export const metadata: Metadata = {
  title: "Gesprek",
  robots: { index: false },
};

export default async function ZzpGesprekPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireCurrentUser();
  const conversation = await getConversation(user.id, id);
  if (!conversation) notFound();

  return (
    <Container className="max-w-3xl py-8 md:py-12">
      <ConversationView
        conversation={conversation}
        currentUserId={user.id}
        tegenpartij={conversation.company.naam || "Bedrijf"}
        basePath="/zzpers/berichten"
      />
    </Container>
  );
}
