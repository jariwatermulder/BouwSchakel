import type { Certification, Skill, Specialization } from "@prisma/client";
import { groepeerSkills } from "@/lib/sectoren";
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

/**
 * "Anders, namelijk…": vinkje + tekstveld dat verschijnt zodra het vinkje
 * aanstaat (CSS-only via group-has). Wordt gebruikt bij vakgebied,
 * specialisatie en certificaten.
 */
function AndersOptie({
  waarde,
  label,
  placeholder,
}: {
  waarde: string | null | undefined;
  label: string;
  placeholder: string;
}) {
  const aan = Boolean(waarde);
  return (
    <div className="group border-border has-[:checked]:border-navy-500 has-[:checked]:bg-navy-50 mt-3 rounded-lg border p-3">
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" name="andersAan" defaultChecked={aan} />
        {label}
      </label>
      <div className="mt-2 hidden group-has-[:checked]:block">
        <Input
          name="anders"
          maxLength={120}
          defaultValue={waarde ?? ""}
          placeholder={placeholder}
          aria-label={label}
        />
        <p className="text-foreground-muted mt-1 text-xs">
          Kort en duidelijk, max. 120 tekens. Dit komt op je profiel te staan.
        </p>
      </div>
    </div>
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
            <Label htmlFor="kvkNummer">KvK-nummer</Label>
            <Input
              id="kvkNummer"
              name="kvkNummer"
              inputMode="numeric"
              pattern="\d{8}"
              placeholder="8 cijfers"
              defaultValue={profile?.kvkNummer ?? ""}
              required
            />
            <p className="text-foreground-muted mt-1 text-xs">
              Verplicht: zonder KvK-nummer wordt je profiel niet zichtbaar
              voor opdrachtgevers.
            </p>
          </div>
          <div>
            <Label htmlFor="bedrijfsnaam">Bedrijfsnaam (optioneel)</Label>
            <Input
              id="bedrijfsnaam"
              name="bedrijfsnaam"
              defaultValue={profile?.bedrijfsnaam ?? ""}
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
          <div className="space-y-5">
            {groepeerSkills(skills).map(({ sector, skills: sectorSkills }) => (
              <div key={sector}>
                <p className="text-foreground-muted mb-2 text-xs font-semibold tracking-wide uppercase">
                  {sector}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {sectorSkills.map((skill) => (
                    <CheckboxCard
                      key={skill.id}
                      name="skillIds"
                      value={skill.id}
                      label={skill.naam}
                      defaultChecked={selectedSkillIds.has(skill.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {skills.length === 0 ? (
            <p className="text-foreground-muted text-sm">
              Er zijn nog geen vakgebieden geconfigureerd.
            </p>
          ) : null}
          <AndersOptie
            waarde={profile?.vakgebiedAnders}
            label="Anders, namelijk…"
            placeholder="Bijv. glaszetter, hovenier of allround klusser"
          />
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
              Kies eerst een vakgebied om specialisaties te zien, of beschrijf
              hieronder zelf waar je goed in bent.
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
          <AndersOptie
            waarde={profile?.specialisatieAnders}
            label="Anders, namelijk…"
            placeholder="Bijv. renovatie van monumentale panden"
          />
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
          <p className="border-border bg-surface-muted text-foreground-muted rounded-lg border p-3 text-sm">
            Weet je je beschikbaarheid nog niet? Laat dit leeg en klik op
            opslaan — je profiel toont dan <strong>&ldquo;In overleg&rdquo;</strong>. Je kunt
            dit later altijd aanpassen.
          </p>
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
          <AndersOptie
            waarde={profile?.certificatenAnders}
            label="Ander certificaat of diploma, namelijk…"
            placeholder="Bijv. BHV, hoogwerker of asbestherkenning"
          />
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
          <div>
            <Label htmlFor="afbeelding">Foto van het werk (optioneel)</Label>
            <input
              id="afbeelding"
              name="afbeelding"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="border-border bg-surface file:bg-brand-50 file:text-brand-700 block w-full rounded-lg border p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:font-medium"
            />
            <p className="text-foreground-muted mt-1 text-xs">
              JPG, PNG of WebP, max. 8 MB. De foto wordt verkleind en komt op je
              publieke profiel.
            </p>
          </div>
        </div>
      );
  }
}
