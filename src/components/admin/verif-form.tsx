import { Button } from "@/components/ui/button";

const OPTIES: { value: string; label: string }[] = [
  { value: "NIET_GEVERIFIEERD", label: "Niet geverifieerd" },
  { value: "IN_BEHANDELING", label: "In behandeling" },
  { value: "GEVERIFIEERD", label: "Geverifieerd" },
  { value: "AFGEKEURD", label: "Afgekeurd" },
];

/** Herbruikbaar statusformulier voor verificaties (server action als prop). */
export function VerifForm({
  action,
  idField,
  idValue,
  current,
}: {
  action: (fd: FormData) => void | Promise<void>;
  idField: string;
  idValue: string;
  current: string;
}) {
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name={idField} value={idValue} />
      <select
        name="status"
        defaultValue={current}
        className="border-border bg-surface h-9 rounded-lg border px-2 text-sm"
      >
        {OPTIES.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Button type="submit" variant="outline" size="sm">
        Opslaan
      </Button>
    </form>
  );
}
