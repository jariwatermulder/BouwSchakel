import { z } from "zod";

const score = z.coerce
  .number()
  .int()
  .min(1, "Geef een score van 1 tot 5")
  .max(5, "Geef een score van 1 tot 5");

export const reviewSchema = z.object({
  scoreKwaliteit: score,
  scoreCommunicatie: score,
  scoreBetrouwbaarheid: score,
  scoreAfspraken: score,
  toelichting: z.string().trim().max(2000).optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
