import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ConversationListItem } from "@/server/messaging/service";

/**
 * Lijst met gesprekken. `perspectief` bepaalt welke naam we tonen (de
 * tegenpartij) en `basePath` waar de gesprekken heen linken.
 */
export function ConversationList({
  conversations,
  perspectief,
  basePath,
}: {
  conversations: ConversationListItem[];
  perspectief: "zzp" | "bedrijf";
  basePath: string;
}) {
  if (conversations.length === 0) {
    return (
      <Card>
        <CardDescription>Je hebt nog geen berichten.</CardDescription>
      </Card>
    );
  }

  return (
    <ul className="space-y-3">
      {conversations.map((c) => {
        const tegenpartij =
          perspectief === "zzp"
            ? c.company.naam || "Bedrijf"
            : [c.zzpProfile.voornaam, c.zzpProfile.achternaam]
                .filter(Boolean)
                .join(" ") || "Vakman";
        return (
          <li key={c.id}>
            <Link href={`${basePath}/${c.id}`}>
              <Card className="hover:border-navy-300 flex items-center justify-between gap-4 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>{tegenpartij}</CardTitle>
                    {c.ongelezen > 0 ? (
                      <Badge variant="accent">{c.ongelezen} nieuw</Badge>
                    ) : null}
                  </div>
                  <CardDescription>
                    Over: {c.job.titel} · {c.job.skill.naam}
                  </CardDescription>
                </div>
              </Card>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
