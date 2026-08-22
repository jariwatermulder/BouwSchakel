"use client";

import { useActionState, useState } from "react";
import type { Certification, Skill, Specialization } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createOpdracht, type JobFormState } from "./actions";

const initial: JobFormState = {};

const selectClass =
  "border-border bg-surface focus-visible:border-navy-500 h-11 w-full rounded-lg border px-3 text-sm";
const textareaClass =
  "border-border bg-surface focus-visible:border-navy-500 w-full rounded-lg border p-3 text-sm";

export function JobForm({
  skills,
  specializations,
  certifications,
}: {
  skills: Skill[];
  specializations: Specialization[];
  certifications: Certification[];
}) {
  const [state, formAction, pending] = useActionState(createOpdracht, initial);
  const [skillId, setSkillId] = useState("");

  const relevanteSpecs = specializations.filter((s) => s.skillId === skillId);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="skillId">Vakgebied</Label>
          <select
            id="skillId"
            name="skillId"
            required
            className={selectClass}
            value={skillId}
            onChange={(e) => setSkillId(e.target.value)}
          >
            <option value="">Kies een vakgebied…</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.naam}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="specializationId">Specialisatie (optioneel)</Label>
          <select
            id="specializationId"
            name="specializationId"
            className={selectClass}
            disabled={relevanteSpecs.length === 0}
          >
            <option value="">Geen specifieke specialisatie</option>
            {relevanteSpecs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.naam}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="titel">Titel (optioneel)</Label>
        <Input
          id="titel"
          name="titel"
          placeholder="Laat leeg voor automatische titel, bijv. 'Timmerman gezocht'"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="locatiePlaats">Locatie (plaats)</Label>
          <Input
            id="locatiePlaats"
            name="locatiePlaats"
            placeholder="Bijv. Groningen"
            required
          />
        </div>
        <div>
          <Label htmlFor="locatieAdres">Adres (optioneel)</Label>
          <Input id="locatieAdres" name="locatieAdres" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="startdatum">Startdatum</Label>
          <Input id="startdatum" name="startdatum" type="date" required />
        </div>
        <div>
          <Label htmlFor="einddatum">Einddatum (optioneel)</Label>
          <Input id="einddatum" name="einddatum" type="date" />
        </div>
        <div>
          <Label htmlFor="duurDagen">Duur in dagen (optioneel)</Label>
          <Input id="duurDagen" name="duurDagen" type="number" min={1} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="aantalPersonen">Aantal personen</Label>
          <Input
            id="aantalPersonen"
            name="aantalPersonen"
            type="number"
            min={1}
            defaultValue={1}
          />
        </div>
        <div>
          <Label htmlFor="uurtariefEuro">Gewenst uurtarief € (optioneel)</Label>
          <Input
            id="uurtariefEuro"
            name="uurtariefEuro"
            type="number"
            min={1}
            step="0.5"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="omschrijving">Werkzaamheden</Label>
        <textarea
          id="omschrijving"
          name="omschrijving"
          rows={5}
          required
          maxLength={4000}
          placeholder="Beschrijf de werkzaamheden, verwachtingen en context."
          className={textareaClass}
        />
      </div>

      <div>
        <Label htmlFor="vereistenTekst">Overige vereisten (optioneel)</Label>
        <textarea
          id="vereistenTekst"
          name="vereistenTekst"
          rows={2}
          maxLength={1000}
          className={textareaClass}
        />
      </div>

      {certifications.length > 0 ? (
        <fieldset>
          <legend className="mb-2 text-sm font-medium">
            Vereiste certificaten (optioneel)
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {certifications.map((c) => (
              <label
                key={c.id}
                className="border-border has-[:checked]:border-navy-500 has-[:checked]:bg-navy-50 flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm"
              >
                <input type="checkbox" name="certificationIds" value={c.id} />
                {c.naam}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="eigenGereedschapGewenst" />
          Eigen gereedschap gewenst
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="directPubliceren" defaultChecked />
          Direct publiceren (anders opslaan als concept)
        </label>
      </div>

      <div>
        <Label htmlFor="contactpersoon">Contactpersoon (optioneel)</Label>
        <Input id="contactpersoon" name="contactpersoon" />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" variant="accent" size="lg" disabled={pending}>
        {pending ? "Bezig…" : "Opdracht plaatsen"}
      </Button>
    </form>
  );
}
