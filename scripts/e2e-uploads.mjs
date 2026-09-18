/**
 * Aanvullende testronde: profielfoto, portfoliofoto en documentupload
 * (verkleinen, metadata strippen, publieke vs. gesigneerde URL's, opruimen bij
 * verwijderen). Zelfde vereisten als scripts/e2e-testronde.mjs.
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const { PrismaClient } = require("@prisma/client");
const sharp = require("sharp");

if (process.env.E2E_DATABASE_URL) process.env.DATABASE_URL = process.env.E2E_DATABASE_URL;
if (!process.env.DATABASE_URL || /supabase\.co|pooler\.supabase/.test(process.env.DATABASE_URL)) {
  console.error("Weiger: E2E_DATABASE_URL moet naar een lokale testdatabase wijzen (niet Supabase/productie).");
  process.exit(2);
}
const db = new PrismaClient();
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const SHOTS = process.env.E2E_SHOTS ?? path.join(process.cwd(), "e2e-output");
fs.mkdirSync(SHOTS, { recursive: true });
const ADMIN = { email: process.env.ADMIN_EMAIL ?? "admin@test.local", pw: process.env.ADMIN_PASSWORD ?? "AdminTest1234!" };
const RUN = Date.now().toString(36);
const ZZP = { email: `foto-${RUN}@test.local`, pw: "FotoWachtwoord123!" };

const results = [];
const ok = (n, d = "") => { results.push({ n, ok: true }); console.log(`✔ ${n}${d ? " — " + d : ""}`); };
const fail = (n, d = "") => { results.push({ n, ok: false }); console.log(`✘ ${n}${d ? " — " + d : ""}`); };
async function step(n, fn) { try { const d = await fn(); ok(n, typeof d === "string" ? d : ""); } catch (e) { fail(n, (e?.message ?? String(e)).split("\n")[0].slice(0, 220)); } }
const assert = (c, m) => { if (!c) throw new Error(m || "assertion"); };

// Testafbeeldingen: grote JPEG (3000×2000, met EXIF-oriëntatie) en een PNG.
const jpegGroot = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: { r: 30, g: 90, b: 200 } } })
  .composite([{ input: await sharp({ create: { width: 600, height: 600, channels: 3, background: { r: 240, g: 200, b: 60 } } }).png().toBuffer(), left: 1800, top: 700 }])
  .jpeg({ quality: 90 }).withMetadata({ orientation: 6 }).toBuffer();
const png = await sharp({ create: { width: 800, height: 500, channels: 4, background: { r: 200, g: 40, b: 40, alpha: 1 } } }).png().toBuffer();
const pdf = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF");
const groot = Buffer.alloc(9 * 1024 * 1024, 1);

const browser = await chromium.launch({
  ...(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {}),
  args: ["--no-sandbox"],
});
const c = await browser.newContext({ viewport: { width: 1280, height: 900 } }); c.setDefaultTimeout(30000);
const z = await c.newPage();

let user, profile;
await step("Zzp'er registreren + kernprofiel", async () => {
  await z.goto(BASE + "/registreren?rol=zzp");
  await z.fill('input[name="email"]', ZZP.email); await z.fill('input[name="password"]', ZZP.pw); await z.check('input[name="akkoord"]');
  await Promise.all([z.waitForURL(/zzpers\/registreren/), z.click('button[type="submit"]')]);
  await z.fill('input[name="voornaam"]', "Foto"); await z.fill('input[name="achternaam"]', "Tester"); await z.fill('input[name="telefoon"]', "0611111111");
  await Promise.all([z.waitForURL(/stap=vakgebied/), z.click('button[type="submit"]')]);
  await z.check('input[name="skillIds"] >> nth=0'); await Promise.all([z.waitForURL(/stap=werkgebied/), z.click('button[type="submit"]')]);
  await z.fill('input[name="werkgebiedPlaats"]', "Assen"); await z.fill('input[name="maxReisafstandKm"]', "40");
  await Promise.all([z.waitForURL(/stap=beschikbaarheid/), z.click('button[type="submit"]')]);
  await z.fill('input[name="startdatum"]', "2026-10-01"); await Promise.all([z.waitForURL(/zzpers\/profiel/), z.click('button[type="submit"]')]);
  user = await db.user.findUnique({ where: { email: ZZP.email } }); profile = await db.zZPProfile.findUnique({ where: { userId: user.id } });
  assert(profile.zichtbaar);
});

await step("Profielfoto uploaden (3000×2000 JPEG, EXIF-rotatie) → 512×512 WebP zonder metadata", async () => {
  await z.goto(BASE + "/zzpers/profiel");
  await z.setInputFiles('input[name="foto"]', { name: "portret.jpg", mimeType: "image/jpeg", buffer: jpegGroot });
  await Promise.all([z.waitForURL(/foto=ok/), z.click('button:has-text("Foto uploaden")')]);
  profile = await db.zZPProfile.findUnique({ where: { userId: user.id } }); assert(profile.fotoKey?.startsWith("public/profiel/"), "fotoKey: " + profile.fotoKey);
  const f = await db.storedFile.findUnique({ where: { key: profile.fotoKey } }); assert(f && f.publiek && f.mime === "image/webp");
  const meta = await sharp(Buffer.from(f.data)).metadata();
  assert(meta.width === 512 && meta.height === 512 && meta.format === "webp", `${meta.width}×${meta.height} ${meta.format}`);
  assert(!meta.exif && !meta.orientation, "metadata niet gestript");
  await z.screenshot({ path: SHOTS + "/profiel-foto.png" });
  return `${f.grootte} bytes`;
});
await step("Foto publiek bereikbaar via /api/bestanden met lange cache", async () => {
  const r = await fetch(BASE + "/api/bestanden/" + profile.fotoKey);
  assert(r.status === 200 && r.headers.get("content-type") === "image/webp", `${r.status} ${r.headers.get("content-type")}`);
  assert(r.headers.get("cache-control")?.includes("immutable"), r.headers.get("cache-control"));
});
await step("Publiek profiel en etalage tonen de foto", async () => {
  const g = await (await browser.newContext()).newPage();
  await g.goto(BASE + "/vind-zzper/" + profile.id);
  const src = await g.getAttribute('img[alt^="Profielfoto van"]', "src"); assert(src?.includes(profile.fotoKey.split("/").pop()), "src: " + src);
  await g.goto(BASE + "/vind-zzper?plaats=Assen"); await g.waitForSelector('img[alt^="Profielfoto van"]');
  await g.screenshot({ path: SHOTS + "/etalage-foto.png" }); await g.context().close();
});
await step("Nieuwe foto vervangt de oude (oude bestand opgeruimd)", async () => {
  const oud = profile.fotoKey;
  await z.goto(BASE + "/zzpers/profiel");
  await z.setInputFiles('input[name="foto"]', { name: "nieuw.png", mimeType: "image/png", buffer: png });
  await Promise.all([z.waitForURL(/foto=ok/), z.click('button:has-text("Foto uploaden")')]);
  profile = await db.zZPProfile.findUnique({ where: { userId: user.id } }); assert(profile.fotoKey !== oud);
  assert(!(await db.storedFile.findUnique({ where: { key: oud } })), "oude foto niet verwijderd");
});
await step("Ongeldig bestand als profielfoto wordt geweigerd", async () => {
  await z.goto(BASE + "/zzpers/profiel");
  await z.setInputFiles('input[name="foto"]', { name: "x.txt", mimeType: "text/plain", buffer: Buffer.from("geen afbeelding") });
  await Promise.all([z.waitForURL(/foto=fout/), z.click('button:has-text("Foto uploaden")')]);
  await z.waitForSelector("text=Kies een JPG-, PNG- of WebP-afbeelding");
});
await step("Te groot bestand (9 MB) wordt geweigerd", async () => {
  await z.goto(BASE + "/zzpers/profiel");
  await z.setInputFiles('input[name="foto"]', { name: "groot.jpg", mimeType: "image/jpeg", buffer: groot });
  await Promise.all([z.waitForURL(/foto=fout/), z.click('button:has-text("Foto uploaden")')]);
});
await step("Portfolio-item met foto → verkleind (max 1600) en op publiek profiel", async () => {
  await z.goto(BASE + "/zzpers/registreren?stap=portfolio");
  await z.fill('input[name="titel"]', "Aanbouw Assen"); await z.fill('textarea[name="omschrijving"]', "Aanbouw met plat dak.");
  await z.setInputFiles('input[name="afbeelding"]', { name: "werk.jpg", mimeType: "image/jpeg", buffer: jpegGroot });
  await Promise.all([z.waitForURL(/zzpers\/profiel/), z.click('button[type="submit"]')]);
  const item = await db.portfolioItem.findFirst({ where: { zzpProfileId: profile.id } }); assert(item?.afbeeldingKey, "geen afbeeldingKey");
  const f = await db.storedFile.findUnique({ where: { key: item.afbeeldingKey } }); const meta = await sharp(Buffer.from(f.data)).metadata();
  assert(Math.max(meta.width, meta.height) === 1600 && meta.format === "webp", `${meta.width}×${meta.height}`);
  const g = await (await browser.newContext()).newPage();
  await g.goto(BASE + "/vind-zzper/" + profile.id); await g.waitForSelector("text=Werk van"); await g.waitForSelector('img[alt="Aanbouw Assen"]');
  await g.screenshot({ path: SHOTS + "/publiek-portfolio.png", fullPage: true }); await g.context().close();
  return `${f.grootte} bytes`;
});
await step("Portfolio-item verwijderen ruimt de foto op", async () => {
  const item = await db.portfolioItem.findFirst({ where: { zzpProfileId: profile.id } });
  await z.goto(BASE + "/zzpers/profiel"); await z.click('form:has(input[name="itemId"]) button[type="submit"]'); await z.waitForTimeout(1500);
  assert(!(await db.portfolioItem.findUnique({ where: { id: item.id } })), "item bestaat nog");
  assert(!(await db.storedFile.findUnique({ where: { key: item.afbeeldingKey } })), "bestand bestaat nog");
});
let docKey;
await step("Document uploaden (PDF) → privé, alleen via gesigneerde link", async () => {
  await z.goto(BASE + "/zzpers/documenten");
  await z.selectOption('select[name="type"]', "VCA");
  await z.setInputFiles('input[name="bestand"]', { name: "vca.pdf", mimeType: "application/pdf", buffer: pdf });
  await Promise.all([z.waitForURL(/upload=ok/), z.click('button:has-text("Uploaden")')]);
  const d = await db.document.findFirst({ where: { ownerUserId: user.id } }); assert(d?.type === "VCA" && d.bestandsnaam === "vca.pdf"); docKey = d.opslagKey;
  const f = await db.storedFile.findUnique({ where: { key: docKey } }); assert(f && !f.publiek);
  const zonder = await fetch(BASE + "/api/bestanden/" + docKey); assert(zonder.status === 403, "zonder handtekening: " + zonder.status);
  const href = await z.getAttribute('a:has-text("vca.pdf")', "href"); assert(href?.includes("sig="), href);
  const met = await fetch(BASE + href); assert(met.status === 200 && met.headers.get("content-type") === "application/pdf", "met handtekening: " + met.status);
  assert(met.headers.get("cache-control")?.includes("no-store"));
  const vervalst = await fetch(BASE + href.replace(/sig=\w/, "sig=0")); assert(vervalst.status === 403, "vervalste handtekening geaccepteerd");
  await z.screenshot({ path: SHOTS + "/documenten.png" });
});
await step("Verkeerd bestandstype als document wordt geweigerd", async () => {
  await z.goto(BASE + "/zzpers/documenten");
  await z.setInputFiles('input[name="bestand"]', { name: "x.exe", mimeType: "application/octet-stream", buffer: Buffer.from("MZ") });
  await Promise.all([z.waitForURL(/upload=type/), z.click('button:has-text("Uploaden")')]);
});
await step("Admin ziet document met 'Bekijk document'-link (gesigneerd)", async () => {
  const a = await (await browser.newContext()).newPage();
  await a.goto(BASE + "/inloggen"); await a.fill('input[name="email"]', ADMIN.email); await a.fill('input[name="password"]', ADMIN.pw);
  await Promise.all([a.waitForURL(/\/admin/), a.click('button[type="submit"]')]);
  await a.goto(BASE + "/admin/verificaties"); await a.waitForSelector("text=vca.pdf");
  const href = await a.getAttribute('a:has-text("Bekijk document")', "href"); assert(href?.includes("sig="));
  await a.context().close();
});
await step("Gegevensexport bevat fotoKey; account verwijderen ruimt alle bestanden op", async () => {
  const r = await c.request.get(BASE + "/api/account/export"); const j = await r.json(); assert(j.zzpProfiel?.fotoKey === profile.fotoKey);
  const voor = await db.storedFile.count({ where: { ownerUserId: user.id } }); assert(voor === 2, "verwacht 2 bestanden, " + voor);
  await z.goto(BASE + "/zzpers/instellingen"); await z.fill('input[name="bevestig"]', "VERWIJDER");
  await Promise.all([z.waitForURL(u => u.pathname === "/"), z.click("text=Verwijder mijn account")]);
  assert((await db.storedFile.count({ where: { ownerUserId: user.id } })) === 0, "bestanden niet opgeruimd");
  const r2 = await fetch(BASE + "/api/bestanden/" + profile.fotoKey); assert(r2.status === 404, "foto nog bereikbaar: " + r2.status);
});

await browser.close(); await db.$disconnect();
const n = results.filter(r => r.ok).length; console.log(`\n${n}/${results.length} geslaagd`); process.exit(n === results.length ? 0 : 1);
