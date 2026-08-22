import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { listUsers } from "@/server/admin/service";
import { blokkeerGebruiker, wijzigAdminRol } from "../actions";

export const metadata: Metadata = {
  title: "Gebruikers",
  robots: { index: false },
};

export default async function AdminGebruikersPage() {
  const admin = await requireCurrentAdmin("SUPPORT");
  const superAdmin = admin.adminRole === "SUPER_ADMIN";
  const users = await listUsers();

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Gebruikers</h1>
      <ul className="mt-6 space-y-2">
        {users.map((u) => (
          <li key={u.id}>
            <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{u.email}</p>
                <p className="text-foreground-muted text-sm">
                  {u.role}
                  {u.adminRole ? ` · ${u.adminRole}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={u.status === "ACTIEF" ? "verified" : "rejected"}
                >
                  {u.status}
                </Badge>
                <form action={blokkeerGebruiker}>
                  <input type="hidden" name="userId" value={u.id} />
                  <input
                    type="hidden"
                    name="blokkeren"
                    value={u.status === "ACTIEF" ? "1" : "0"}
                  />
                  <Button type="submit" variant="ghost" size="sm">
                    {u.status === "ACTIEF" ? "Blokkeren" : "Deblokkeren"}
                  </Button>
                </form>
                {superAdmin ? (
                  <form action={wijzigAdminRol} className="flex gap-1">
                    <input type="hidden" name="userId" value={u.id} />
                    <select
                      name="adminRole"
                      defaultValue={u.adminRole ?? ""}
                      className="border-border bg-surface h-9 rounded-lg border px-2 text-sm"
                    >
                      <option value="">Geen admin</option>
                      <option value="SUPPORT">Support</option>
                      <option value="MODERATOR">Moderator</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super admin</option>
                    </select>
                    <Button type="submit" variant="outline" size="sm">
                      Zet rol
                    </Button>
                  </form>
                ) : null}
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </Container>
  );
}
