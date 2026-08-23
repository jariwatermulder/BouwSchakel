import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Publiek zichtbare, indexeerbare opdrachten (SEO). Alleen gepubliceerd en als
 * publiek gemarkeerd; geen privégegevens. Zie docs/ARCHITECTURE.md §9.
 */
const publicInclude = {
  company: { select: { naam: true, verificatieStatus: true } },
  skill: true,
  specialization: true,
  requirements: { include: { certification: true } },
} satisfies Prisma.JobInclude;

export type PublicJob = Prisma.JobGetPayload<{ include: typeof publicInclude }>;

export async function listPublicJobs(): Promise<PublicJob[]> {
  return db.job.findMany({
    where: {
      status: "GEPUBLICEERD",
      deletedAt: null,
      publiekIndexeerbaar: true,
    },
    include: publicInclude,
    orderBy: { startdatum: "asc" },
    take: 200,
  });
}

export async function getPublicJobBySlug(
  slug: string,
): Promise<PublicJob | null> {
  return db.job.findFirst({
    where: {
      slug,
      status: "GEPUBLICEERD",
      deletedAt: null,
      publiekIndexeerbaar: true,
    },
    include: publicInclude,
  });
}

/** Lichtgewicht lijst (slug + datum) voor de sitemap. */
export async function listPublicJobSlugs(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  return db.job.findMany({
    where: {
      status: "GEPUBLICEERD",
      deletedAt: null,
      publiekIndexeerbaar: true,
    },
    select: { slug: true, updatedAt: true },
    take: 5000,
  });
}
