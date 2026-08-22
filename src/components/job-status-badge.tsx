import type { JobStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const config: Record<
  JobStatus,
  {
    label: string;
    variant: "neutral" | "verified" | "pending" | "rejected" | "accent";
  }
> = {
  CONCEPT: { label: "Concept", variant: "neutral" },
  GEPUBLICEERD: { label: "Gepubliceerd", variant: "verified" },
  GESLOTEN: { label: "Gesloten", variant: "neutral" },
  VERVULD: { label: "Vervuld", variant: "accent" },
  VERLOPEN: { label: "Verlopen", variant: "pending" },
  GEANNULEERD: { label: "Geannuleerd", variant: "rejected" },
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const c = config[status];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
