import Link from "next/link";
import type { Notification } from "@prisma/client";
import { Card, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { markeerMeldingenGelezen } from "@/app/(app)/notification-actions";

function tijd(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function NotificationList({
  notifications,
  basePath,
}: {
  notifications: Notification[];
  basePath: string;
}) {
  const ongelezen = notifications.filter((n) => n.gelezenOp === null).length;

  return (
    <div>
      {ongelezen > 0 ? (
        <form action={markeerMeldingenGelezen} className="mb-4">
          <input type="hidden" name="basePath" value={basePath} />
          <Button type="submit" variant="outline" size="sm">
            Alles als gelezen markeren ({ongelezen})
          </Button>
        </form>
      ) : null}

      {notifications.length === 0 ? (
        <Card>
          <CardDescription>Je hebt geen meldingen.</CardDescription>
        </Card>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const inhoud = (
              <Card
                className={
                  n.gelezenOp === null ? "border-navy-300 bg-navy-50" : ""
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{n.titel}</p>
                    <p className="text-foreground-muted text-sm">{n.tekst}</p>
                  </div>
                  <span className="text-foreground-muted shrink-0 text-xs">
                    {tijd(n.createdAt)}
                  </span>
                </div>
              </Card>
            );
            return (
              <li key={n.id}>
                {n.link ? <Link href={n.link}>{inhoud}</Link> : inhoud}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
