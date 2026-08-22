import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { listReviews } from "@/server/admin/service";
import { reviewGemiddelde } from "@/server/reviews/scoring";
import { verwijderReview } from "../actions";

export const metadata: Metadata = {
  title: "Reviews",
  robots: { index: false },
};

export default async function AdminReviewsPage() {
  await requireCurrentAdmin("SUPPORT");
  const reviews = await listReviews();

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Reviews modereren</h1>
      {reviews.length === 0 ? (
        <Card className="mt-6">
          <CardDescription>Er zijn nog geen reviews.</CardDescription>
        </Card>
      ) : (
        <ul className="mt-6 space-y-2">
          {reviews.map((r) => (
            <li key={r.id}>
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <StarRating waarde={reviewGemiddelde(r)} />
                    <span className="text-foreground-muted text-xs">
                      {r.richting} · {r.assignment.job.titel}
                    </span>
                  </div>
                  {r.toelichting ? (
                    <p className="text-foreground-muted mt-1 text-sm">
                      {r.toelichting}
                    </p>
                  ) : null}
                </div>
                <form action={verwijderReview}>
                  <input type="hidden" name="reviewId" value={r.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Verwijderen
                  </Button>
                </form>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
