import { describe, expect, it } from "vitest";
import { isPreviewDeployment, PRODUCTIE_ORIGIN, resolveAppUrl } from "@/lib/app-url";

describe("resolveAppUrl", () => {
  it("gebruikt een expliciete APP_URL op een eigen domein", () => {
    expect(resolveAppUrl({ APP_URL: "https://www.zzpschakel.nl/" })).toBe("https://www.zzpschakel.nl");
    expect(resolveAppUrl({ APP_URL: "www.zzpschakel.nl", VERCEL_ENV: "production" })).toBe("https://www.zzpschakel.nl");
  });

  it("negeert in productie een APP_URL die nog naar een *.vercel.app-host wijst", () => {
    expect(resolveAppUrl({ APP_URL: "https://bouw-schakel.vercel.app", VERCEL_ENV: "production" })).toBe(PRODUCTIE_ORIGIN);
    expect(resolveAppUrl({ VERCEL_ENV: "production", VERCEL_URL: "bouw-schakel-abc.vercel.app" })).toBe(PRODUCTIE_ORIGIN);
  });

  it("gebruikt op een preview de deploy-URL", () => {
    expect(resolveAppUrl({ VERCEL_ENV: "preview", VERCEL_URL: "bouw-schakel-git-x.vercel.app" })).toBe(
      "https://bouw-schakel-git-x.vercel.app",
    );
    expect(isPreviewDeployment({ VERCEL_ENV: "preview" })).toBe(true);
    expect(isPreviewDeployment({ VERCEL_ENV: "production" })).toBe(false);
    expect(isPreviewDeployment({})).toBe(false);
  });

  it("valt lokaal terug op localhost of een vercel.app-APP_URL", () => {
    expect(resolveAppUrl({})).toBe("http://localhost:3000");
    expect(resolveAppUrl({ APP_URL: "https://bouwschakel.vercel.app" })).toBe("https://bouwschakel.vercel.app");
    expect(resolveAppUrl({ APP_URL: "niet een url::" })).toBe("http://localhost:3000");
  });
});
