import type { Certification, Skill, Specialization } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProfileWithRelations } from "@/server/zzp/profile";
import type { StapSlug } from "./steps";

function CheckboxCard({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="border-border has-[:checked]:border-navy-500 has-[:checked]:bg-navy-50 flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
      />
      {label}
    </label>
  );
}

export function StepFields({
  slug,
  profile,
  skills,
  specializations,
  certifications,
}: {
  slug: StapSlug;
  profile: ProfileWithRelations | null;
  skills: Skill[];
  specializations: Specialization[];
  certifications: Certification[];
}) {
  const selectedSkillIds = new Set(profile?.skills.map((s) => s.skillId));
  const selectedSpecIds = new Set(
    profile?.specializations.map((s) => s.specializationId),
  );
  const selectedCertIds = new Set(
    profile?.certifications.map((c) => c.certificationId),
  );

  switch (slug) {
    case "persoonlijk":
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="voornaam">Voornaam</Label>
              <Input
                id="voornaam"
                name="voornaam"
                defaultValue={profile?.voornaam ?? ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="achternaam">Achternaam</Label>
              <Input
                id="achternaam"
                name="achternaam"
                defaultValue={profile?.achternaam ?? ""}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="telefoon">Telefoon (optioneel)</Label>
            <Input
              id="telefoon"
              name="telefoon"
              type="tel"
              defaultValue={profile?.telefoon ?? ""}
            />
          </div>
        </div>
      );

    case "bedrijf":
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="bedrijfsnaam">Bedrijfsnaam (optioneel)</Label>
            <Input
              id="bedrijfsnaam"
              name="bedrijfsnaam"
              defaultValue={profile?.bedrijfsnaam ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="kvkNummer">KvK-nummer (optioneel)</Label>
            <Input
              id="kvkNummer"
              name="kvkNummer"
              inputMode="numeric"
              pattern="\d{8}"
              placeholder="8 cijfers"
              defaultValue={profile?.kvkNummer ?? ""}
            />
          </div>
        </div>
      );

    case "vakgebied":
      return (
        <fieldset>
          <legend className="mb-2 text-sm font-medium">
            Kies je vakgebied(en)
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {skills.map((skill) => (
              <CheckboxCard
                key={skill.id}
                name="skillIds"
                value={skill.id}
                label={skill.naam}
                defaultChecked={selectedSkillIds.has(skill.id)}
              />
            ))}
          </div>
          {skills.length === 0 ? (
            <p className="text-foreground-muted text-sm">
              Er zijn nog geen vakgebieden geconfigureerd.
            </p>
          ) : null}
        </fieldset>
      );

    case "specialisatie":
      return (
        <fieldset>
          <legend className="mb-2 text-sm font-medium">
            Specialisaties (optioneel)
          </legend>
          {specializations.length === 0 ? (
            <p className="text-foreground-muted text-sm">
              Kies eerst een vakgebied om specialisaties te zien, of sla deze
              stap over.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {specializations.map((spec) => (
                <CheckboxCard
                  key={spec.id}
                  name="specializationIds"
                  value={spec.id}
                  label={spec.naam}
                  defaultChecked={selectedSpecIds.has(spec.id)}
                />
              ))}
            </div>
          )}
        </fieldset>
      );

    case "ervaring":
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="jarenErvaring">Jaren ervaring</Label>
            <Input
              id="jarenErvaring"
              name="jarenErvaring"
              type="number"
              min={0}
              max={60}
              defaultValue={profile?.jarenErvaring ?? ""}
              required
            />
          </div>
          <div>
            <Label htmlFor="over">Over jou (optioneel)</Label>
            <textarea
              id="over"
              name="over"
              rows={4}
              maxLength={2000}
              defaultValue={profile?.over ?? ""}
              className="border-border bg-surface focus-visible:border-navy-500 w-full rounded-lg border p-3 text-sm"
            />
          </div>
        </div>
      );

    case "tarief":
      return (
        <div>
          <Label htmlFor="uurtariefEuro">Uurtarief (€)</Label>
          <Input
            id="uurtariefEuro"
            name="uurtariefEuro"
            type="number"
            min={1}
            max={500}
            step="0.5"
            defaultValue={
              profile?.uurtariefCents ? profile.uurtariefCents / 100 : ""
            }
            required
          />
        </div>
      );

    case "werkgebied":
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="werkgebiedPlaats">Plaats</Label>
            <Input
              id="werkgebiedPlaats"
              name="werkgebiedPlaats"
              defaultValue={profile?.werkgebiedPlaats ?? ""}
              placeholder="Bijv. Groningen"
              required
            />
          </div>
          <div>
            <Label htmlFor="maxReisafstandKm">Maximale reisafstand (km)</Label>
            <Input
              id="maxReisafstandKm"
              name="maxReisafstandKm"
              type="number"
              min={1}
              max={500}
              defaultValue={profile?.maxReisafstandKm ?? ""}
              required
            />
          </div>
        </div>
      );

    case "beschikbaarheid":
      return (
        <div className="space-y-6">
          <div>
            <Label htmlFor="startdatum">Beschikbaar vanaf (startdatum)</Label>
            <Input
              id="startdatum"
              name="startdatum"
              type="date"
              defaultValue={
                profile?.startdatum
                  ? profile.startdatum.toISOString().slice(0, 10)
                  : ""
              }
            />
          </div>
          <div className="border-border rounded-lg border p-4">
            <p className="mb-3 text-sm font-medium">
              Beschikbaarheidsperiode toevoegen (optioneel)
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="van">Van</Label>
                <Input id="van" name="van" type="date" />
              </div>
              <div>
                <Label htmlFor="tot">Tot (optioneel)</Label>
                <Input id="tot" name="tot" type="date" />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  name="type"
                  className="border-border bg-surface h-11 w-full rounded-lg border px-3 text-sm"
                  defaultValue="FULLTIME"
                >
                  <option value="FULLTIME">Fulltime</option>
                  <option value="PARTTIME">Parttime</option>
                  <option value="INCIDENTEEL">Incidenteel</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      );

    case "materieel":
      return (
        <div className="space-y-2">
          <CheckboxCard
            name="eigenBus"
            value="on"
            label="Ik heb een eigen bus"
            defaultChecked={profile?.eigenBus}
          />
          <CheckboxCard
            name="eigenGereedschap"
            value="on"
            label="Ik heb eigen gereedschap"
            defaultChecked={profile?.eigenGereedschap}
          />
          <CheckboxCard
            name="vca"
            value="on"
            label="Ik heb een geldig VCA-certificaat"
            defaultChecked={profile?.vca}
          />
        </div>
      );

    case "certificaten":
      return (
        <fieldset>
          <legend className="mb-2 text-sm font-medium">
            Certificaten (optioneel)
          </legend>
          {certifications.length === 0 ? (
            <p className="text-foreground-muted text-sm">
              Er zijn nog geen certificaten geconfigureerd.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {certifications.map((cert) => (
                <CheckboxCard
                  key={cert.id}
                  name="certificationIds"
                  value={cert.id}
                  label={cert.naam}
                  defaultChecked={selectedCertIds.has(cert.id)}
                />
              ))}
            </div>
          )}
        </fieldset>
      );

    case "portfolio":
      return (
        <div className="space-y-4">
          <p className="text-foreground-muted text-sm">
            Voeg een voorbeeldproject toe (optioneel). Later kun je er meer
            beheren op je profiel.
          </p>
          <div>
            <Label htmlFor="titel">Titel</Label>
            <Input
              id="titel"
              name="titel"
              placeholder="Bijv. Renovatie woning"
            />
          </div>
          <div>
            <Label htmlFor="omschrijving">Omschrijving (optioneel)</Label>
            <textarea
              id="omschrijving"
              name="omschrijving"
              rows={3}
              maxLength={1000}
              className="border-border bg-surface focus-visible:border-navy-500 w-full rounded-lg border p-3 text-sm"
            />
          </div>
        </div>
      );
  }
}
