import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { verstuurBericht } from "@/app/(app)/message-actions";
import type { ConversationWithMessages } from "@/server/messaging/service";

function tijd(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export function ConversationView({
  conversation,
  currentUserId,
  tegenpartij,
  basePath,
}: {
  conversation: ConversationWithMessages;
  currentUserId: string;
  tegenpartij: string;
  basePath: string;
}) {
  return (
    <div>
      <Card>
        <CardTitle>{tegenpartij}</CardTitle>
        <p className="text-foreground-muted text-sm">
          Over: {conversation.job.titel} · {conversation.job.skill.naam}
        </p>
      </Card>

      <div className="mt-4 space-y-3">
        {conversation.messages.length === 0 ? (
          <p className="text-foreground-muted text-sm">
            Nog geen berichten. Stuur het eerste bericht.
          </p>
        ) : (
          conversation.messages.map((m) => {
            const vanMij = m.senderUserId === currentUserId;
            return (
              <div
                key={m.id}
                className={cn("flex", vanMij ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    vanMij
                      ? "bg-navy-800 text-white"
                      : "border-border bg-surface border",
                  )}
                >
                  <p className="whitespace-pre-line">{m.body}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      vanMij ? "text-navy-200" : "text-foreground-muted",
                    )}
                  >
                    {tijd(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        action={verstuurBericht}
        className="border-border mt-4 flex gap-2 border-t pt-4"
      >
        <input type="hidden" name="conversationId" value={conversation.id} />
        <input type="hidden" name="basePath" value={basePath} />
        <input
          name="body"
          required
          maxLength={4000}
          placeholder="Typ een bericht…"
          className="border-border bg-surface focus-visible:border-navy-500 h-11 flex-1 rounded-lg border px-3 text-sm"
        />
        <Button type="submit" variant="accent">
          Versturen
        </Button>
      </form>
    </div>
  );
}
