import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { listAllCertifications, listAllSkills } from "@/server/admin/service";
import {
  nieuwCertificaat,
  nieuweSkill,
  toggleCertificaatActief,
  toggleSkillActief,
} from "../actions";

export const metadata: Metadata = {
  title: "Catalogus",
  robots: { index: false },
};

export default async function AdminCatalogusPage() {
  await requireCurrentAdmin("SUPPORT");
  const [skills, certs] = await Promise.all([
    listAllSkills(),
    listAllCertifications(),
  ]);

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Catalogus</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Vakgebieden</CardTitle>
          <form action={nieuweSkill} className="mt-3 flex gap-2">
            <Input name="naam" placeholder="Nieuw vakgebied" required />
            <Button type="submit" variant="accent">
              Toevoegen
            </Button>
          </form>
          <ul className="mt-4 space-y-1">
            {skills.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  {s.naam}
                  {!s.actief ? <Badge variant="neutral">inactief</Badge> : null}
                </span>
                <form action={toggleSkillActief}>
                  <input type="hidden" name="id" value={s.id} />
                  <input
                    type="hidden"
                    name="actief"
                    value={s.actief ? "0" : "1"}
                  />
                  <button
                    type="submit"
                    className="text-navy-700 text-xs hover:underline"
                  >
                    {s.actief ? "Deactiveren" : "Activeren"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle>Certificaten</CardTitle>
          <form action={nieuwCertificaat} className="mt-3 flex gap-2">
            <Input name="naam" placeholder="Nieuw certificaat" required />
            <Button type="submit" variant="accent">
              Toevoegen
            </Button>
          </form>
          <ul className="mt-4 space-y-1">
            {certs.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  {c.naam}
                  {!c.actief ? <Badge variant="neutral">inactief</Badge> : null}
                </span>
                <form action={toggleCertificaatActief}>
                  <input type="hidden" name="id" value={c.id} />
                  <input
                    type="hidden"
                    name="actief"
                    value={c.actief ? "0" : "1"}
                  />
                  <button
                    type="submit"
                    className="text-navy-700 text-xs hover:underline"
                  >
                    {c.actief ? "Deactiveren" : "Activeren"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Container>
  );
}
