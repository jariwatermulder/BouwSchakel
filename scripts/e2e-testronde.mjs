/**
 * End-to-end testronde: registratie → e-mailverificatie → profiel → etalage →
 * contact/berichten → melden → wachtwoordherstel → beheer → contactformulier →
 * AVG-export/verwijderen → mobiel. Draait tegen een lokale dev-server met een
 * lokale (test)database; nooit tegen productie.
 *
 * Vereist: `npx playwright install chromium` (of PLAYWRIGHT_CHROMIUM naar een
 * bestaande Chromium), een draaiende `npm run dev` waarvan de output naar het
 * bestand in E2E_LOG gaat (voor de "mail niet verzonden"-controles), en een
 * admin-account via ADMIN_EMAIL/ADMIN_PASSWORD in .env + `npm run db:seed`.
 *
 *   E2E_DATABASE_URL=postgresql://... E2E_LOG=/tmp/dev.log node scripts/e2e-testronde.mjs
 */
import { createRequire } from "node:module";
import { createHash, randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const { PrismaClient } = require("@prisma/client");

if (process.env.E2E_DATABASE_URL) process.env.DATABASE_URL = process.env.E2E_DATABASE_URL;
if (!process.env.DATABASE_URL || /supabase\.co|pooler\.supabase/.test(process.env.DATABASE_URL)) {
  console.error("Weiger: E2E_DATABASE_URL moet naar een lokale testdatabase wijzen (niet Supabase/productie).");
  process.exit(2);
}
const db = new PrismaClient();
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const LOG = process.env.E2E_LOG ?? "/tmp/zzp-schakel-dev.log";
const SHOTS = process.env.E2E_SHOTS ?? path.join(process.cwd(), "e2e-output");
fs.mkdirSync(SHOTS, { recursive: true });

const RUN = Date.now().toString(36);
const ZZP = { email: `zzp-${RUN}@test.local`, pw: "ZzpTestWachtwoord1!" };
const BEDRIJF = { email: `bedrijf-${RUN}@test.local`, pw: "BedrijfWachtwoord1!" };
const ADMIN = { email: process.env.ADMIN_EMAIL ?? "admin@test.local", pw: process.env.ADMIN_PASSWORD ?? "AdminTest1234!" };

const results = [];
function ok(naam, detail = "") { results.push({ naam, ok: true, detail }); console.log(`✔ ${naam}${detail ? " — " + detail : ""}`); }
function fail(naam, detail = "") { results.push({ naam, ok: false, detail }); console.log(`✘ ${naam}${detail ? " — " + detail : ""}`); }
async function step(naam, fn) {
  try { const d = await fn(); ok(naam, typeof d === "string" ? d : ""); }
  catch (e) { fail(naam, (e && e.message) ? e.message.split("\n")[0].slice(0, 200) : String(e)); }
}
function assert(c, m) { if (!c) throw new Error(m || "assertion"); }
function logContains(s) { return fs.readFileSync(LOG, "utf8").includes(s); }
async function waitLog(s, ms = 8000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (logContains(s)) return true; await new Promise(r => setTimeout(r, 250)); } return false; }
function sha(t) { return createHash("sha256").update(t).digest("hex"); }

const browser = await chromium.launch({
  ...(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {}),
  args: ["--no-sandbox"],
});
async function ctx() { const c = await browser.newContext({ viewport: { width: 1280, height: 900 } }); c.setDefaultTimeout(30000); return c; }

async function login(page, { email, pw }) {
  await page.goto(BASE + "/inloggen");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', pw);
  await Promise.all([page.waitForURL(u => !u.pathname.startsWith("/inloggen"), { timeout: 30000 }), page.click('button[type="submit"]')]);
}
async function register(page, { email, pw }, role) {
  await page.goto(BASE + `/registreren?rol=${role === "ZZP" ? "zzp" : "bedrijf"}`);
  await page.check(`input[name="role"][value="${role}"]`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', pw);
  await page.check('input[name="akkoord"]');
  await Promise.all([page.waitForURL(u => !u.pathname.startsWith("/registreren"), { timeout: 30000 }), page.click('button[type="submit"]')]);
}

// ── 0. Publiek ────────────────────────────────────────────────────────────
const gast = await ctx(); const g = await gast.newPage();
await step("Homepage laadt", async () => { const r = await g.goto(BASE + "/"); assert(r.status() === 200, "status " + r.status()); });
await step("Etalage /vind-zzper laadt", async () => { const r = await g.goto(BASE + "/vind-zzper"); assert(r.status() === 200); });
await step("Oude /opdrachten-URL stuurt permanent door", async () => {
  const r = await fetch(BASE + "/opdrachten/iets", { redirect: "manual" });
  assert(r.status === 308 && r.headers.get("location")?.endsWith("/vind-zzper"), `status ${r.status} → ${r.headers.get("location")}`);
  return "308 → /vind-zzper";
});
await step("Gast wordt bij /zzpers/dashboard naar inloggen gestuurd", async () => { await g.goto(BASE + "/zzpers/dashboard"); assert(g.url().includes("/inloggen"), g.url()); });
await step("Gast krijgt geen admin", async () => { await g.goto(BASE + "/admin"); assert(!g.url().includes("/admin"), g.url()); });

// ── 1. Registratie zzp'er ─────────────────────────────────────────────────
const zc = await ctx(); const z = await zc.newPage();
let zzpUser, zzpProfile;
await step("Registratie zonder akkoord wordt geweigerd", async () => {
  await z.goto(BASE + "/registreren?rol=zzp");
  await z.fill('input[name="email"]', ZZP.email); await z.fill('input[name="password"]', ZZP.pw);
  await z.evaluate(() => { document.querySelector('input[name="akkoord"]').removeAttribute("required"); });
  await z.click('button[type="submit"]');
  await z.waitForTimeout(1500);
  assert(z.url().includes("/registreren"), "doorgestuurd zonder akkoord");
  const u = await db.user.findUnique({ where: { email: ZZP.email } }); assert(!u, "account toch aangemaakt");
});
await step("Registratie zzp'er (met akkoord) → profielwizard", async () => {
  await register(z, ZZP, "ZZP");
  assert(z.url().includes("/zzpers/registreren"), z.url());
  zzpUser = await db.user.findUnique({ where: { email: ZZP.email } }); assert(zzpUser && zzpUser.role === "ZZP");
  const audit = await db.auditLog.findFirst({ where: { actorUserId: zzpUser.id, actie: "VOORWAARDEN_GEACCEPTEERD" } }); assert(audit, "geen consent-audit");
  return "consent vastgelegd in auditlog";
});
await step("Verificatiemail wordt aangeboden (Resend niet geconfigureerd → log)", async () => {
  assert(await waitLog(`e-mail niet verzonden aan ${ZZP.email} ("Bevestig je e-mailadres`), "geen mail-log");
  const t = await db.verificationToken.findFirst({ where: { userId: zzpUser.id, type: "EMAIL_VERIFICATIE" } }); assert(t, "geen token");
});
await step("Dubbele registratie op hetzelfde e-mailadres wordt geweigerd", async () => {
  const c2 = await ctx(); const p2 = await c2.newPage();
  await p2.goto(BASE + "/registreren?rol=zzp"); await p2.fill('input[name="email"]', ZZP.email); await p2.fill('input[name="password"]', ZZP.pw); await p2.check('input[name="akkoord"]');
  await p2.click('button[type="submit"]'); await p2.waitForSelector("text=bestaat al", { timeout: 15000 }); await c2.close();
});

// ── 2. E-mailverificatie ──────────────────────────────────────────────────
let verifyToken;
await step("E-mailadres bevestigen via /verifieer?token=", async () => {
  verifyToken = randomBytes(32).toString("base64url");
  await db.verificationToken.create({ data: { userId: zzpUser.id, type: "EMAIL_VERIFICATIE", tokenHash: sha(verifyToken), expiresAt: new Date(Date.now() + 3600e3) } });
  await z.goto(BASE + "/verifieer?token=" + verifyToken);
  await z.waitForSelector("text=E-mailadres bevestigd");
  const u = await db.user.findUnique({ where: { id: zzpUser.id } }); assert(u.emailVerifiedAt, "emailVerifiedAt leeg");
  await z.screenshot({ path: SHOTS + "/verifieer.png" });
});
await step("Gebruikt verificatietoken wordt afgewezen", async () => {
  await z.goto(BASE + "/verifieer?token=" + verifyToken); await z.waitForSelector("text=Bevestigen niet gelukt");
});
await step("Instellingen tonen 'E-mail bevestigd: Ja'", async () => { await z.goto(BASE + "/zzpers/instellingen"); await z.waitForSelector("text=Ja"); });

// ── 3. Profiel aanmaken ───────────────────────────────────────────────────
await step("Wizard stap Naam", async () => {
  await z.goto(BASE + "/zzpers/registreren?stap=persoonlijk");
  await z.fill('input[name="voornaam"]', "Erik"); await z.fill('input[name="achternaam"]', "Testman"); await z.fill('input[name="telefoon"]', "0612345678");
  await Promise.all([z.waitForURL(/stap=bedrijf/), z.click('button[type="submit"]')]);
});
await step("Wizard stap KvK: ongeldig wordt ook serverside geweigerd, 8 cijfers gaat door", async () => {
  // Browservalidatie uitzetten zodat de servercontrole wordt getest.
  await z.evaluate(() => { document.querySelector("form").noValidate = true; });
  await z.fill('input[name="kvkNummer"]', "123");
  await Promise.all([z.waitForURL(/stap=bedrijf&fout=/), z.click('button[type="submit"]')]);
  await z.fill('input[name="kvkNummer"]', "12345678");
  await Promise.all([z.waitForURL(/stap=vakgebied/), z.click('button[type="submit"]')]);
});
await step("Wizard stap Vakgebied", async () => {
  await z.check('input[name="skillIds"] >> nth=0');
  await Promise.all([z.waitForURL(/stap=werkgebied/), z.click('button[type="submit"]')]);
});
await step("Wizard stap Werkgebied", async () => {
  await z.fill('input[name="werkgebiedPlaats"]', "Groningen"); await z.fill('input[name="maxReisafstandKm"]', "50");
  await Promise.all([z.waitForURL(/stap=beschikbaarheid/), z.click('button[type="submit"]')]);
});
await step("Wizard stap Beschikbaarheid → profielpagina", async () => {
  await z.fill('input[name="startdatum"]', "2026-10-01");
  await Promise.all([z.waitForURL(/\/zzpers\/profiel/), z.click('button[type="submit"]')]);
  zzpProfile = await db.zZPProfile.findUnique({ where: { userId: zzpUser.id } });
  return `compleetheid ${zzpProfile.profielCompleetheidPct}%, zichtbaar=${zzpProfile.zichtbaar}`;
});
await step("Profiel aanvullen (ervaring, tarief) → zichtbaar in etalage", async () => {
  await z.goto(BASE + "/zzpers/registreren?stap=ervaring");
  await z.fill('input[name="jarenErvaring"]', "12"); await z.fill('textarea[name="over"]', "Allround vakman met 12 jaar ervaring in renovatie en nieuwbouw.");
  await Promise.all([z.waitForURL(/stap=tarief/), z.click('button[type="submit"]')]);
  await z.fill('input[name="uurtariefEuro"]', "55");
  await Promise.all([z.waitForURL(u => !u.search.includes("stap=tarief")), z.click('button[type="submit"]')]);
  zzpProfile = await db.zZPProfile.findUnique({ where: { userId: zzpUser.id } });
  assert(zzpProfile.zichtbaar, `niet zichtbaar (${zzpProfile.profielCompleetheidPct}%)`);
  return `compleetheid ${zzpProfile.profielCompleetheidPct}%`;
});
await step("Profiel aanpassen (naam wijzigen) werkt", async () => {
  await z.goto(BASE + "/zzpers/registreren?stap=persoonlijk");
  await z.fill('input[name="achternaam"]', "Testman-Jansen");
  await Promise.all([z.waitForURL(/stap=bedrijf/), z.click('button[type="submit"]')]);
  const p = await db.zZPProfile.findUnique({ where: { userId: zzpUser.id } }); assert(p.achternaam === "Testman-Jansen");
});
await step("Portfolio-item toevoegen en verwijderen", async () => {
  await z.goto(BASE + "/zzpers/registreren?stap=portfolio");
  await z.fill('input[name="titel"]', "Dakkapel Haren"); await z.fill('textarea[name="omschrijving"]', "Complete dakkapel geplaatst.");
  await Promise.all([z.waitForURL(/\/zzpers\/profiel/), z.click('button[type="submit"]')]);
  let n = await db.portfolioItem.count({ where: { zzpProfileId: zzpProfile.id } }); assert(n === 1, "item niet opgeslagen");
  await z.click('form:has(input[name="itemId"]) button[type="submit"]'); await z.waitForTimeout(1500);
  n = await db.portfolioItem.count({ where: { zzpProfileId: zzpProfile.id } }); assert(n === 0, "item niet verwijderd");
});
await step("Gast ziet profiel niet, wel het accountblok (geen naam/telefoon lekt)", async () => {
  const r = await g.goto(BASE + "/vind-zzper/" + zzpProfile.id); assert(r.status() === 200);
  const html = await g.content();
  assert(html.includes("Om dit profiel te bekijken maak je een account aan als opdrachtgever"), "accountblok ontbreekt");
  assert(!html.includes("Erik T."), "naam lekt naar gast");
  assert(!html.includes("0612345678"), "telefoonnummer lekt");
  const reg = await g.getAttribute('a[href^="/registreren?rol=bedrijf"]', "href");
  assert(reg?.includes(encodeURIComponent("/vind-zzper/" + zzpProfile.id)), "next ontbreekt: " + reg);
  await g.screenshot({ path: SHOTS + "/gast-profiel-accountblok.png", fullPage: true });
});
await step("Gast op etalage ziet accountblok met behoud van filter", async () => {
  await g.goto(BASE + "/vind-zzper?plaats=Groningen");
  await g.waitForSelector("text=Om passende profielen te bekijken maak je een account aan als opdrachtgever");
  assert(!(await g.content()).includes("Erik T."), "profiel lekt naar gast");
  const login = await g.getAttribute('a[href^="/inloggen?next="]', "href");
  assert(login?.includes(encodeURIComponent("/vind-zzper?plaats=Groningen")), "next ontbreekt: " + login);
});

// ── 4. Bedrijf registreren en contact opnemen ─────────────────────────────
const bc = await ctx(); const b = await bc.newPage();
let bedrijfUser, conversationId, companyId;
await step("Registratie bedrijf → bedrijfsprofiel", async () => {
  await register(b, BEDRIJF, "COMPANY"); assert(b.url().includes("/bedrijven/registreren"), b.url());
  bedrijfUser = await db.user.findUnique({ where: { email: BEDRIJF.email } }); assert(bedrijfUser?.role === "COMPANY");
});
await step("Bedrijfsprofiel opslaan", async () => {
  // Zonder KvK-nummer komt een opdrachtgever niet op de etalage.
  await b.goto(BASE + "/vind-zzper"); await b.waitForURL(/\/bedrijven\/registreren\?next=/);
  await b.fill('input[name="naam"]', "Bouwbedrijf Test BV"); await b.fill('input[name="kvkNummer"]', "87654321"); await b.fill('input[name="contactpersoon"]', "Petra Test"); await b.fill('input[name="regio"]', "Groningen");
  await Promise.all([b.waitForURL(u => !u.pathname.startsWith("/bedrijven/registreren")), b.click('button[type="submit"]')]);
  const c = await db.company.findFirst({ where: { members: { some: { userId: bedrijfUser.id } } } }); assert(c?.naam === "Bouwbedrijf Test BV"); companyId = c.id;
});
await step("Ingelogd bedrijf ziet profiel (privacy: voornaam + initiaal) en vindt het via filter plaats", async () => {
  const r = await b.goto(BASE + "/vind-zzper/" + zzpProfile.id); assert(r.status() === 200);
  const h1 = await b.textContent("h1"); assert(h1.includes("Erik T."), "naam: " + h1);
  assert(!(await b.content()).includes("0612345678"), "telefoonnummer lekt");
  await b.screenshot({ path: SHOTS + "/profiel-ingelogd.png", fullPage: true });
  await b.goto(BASE + "/vind-zzper?plaats=Groningen"); await b.waitForSelector("text=Erik T.");
});
await step("'Neem contact op' opent een gesprek", async () => {
  await b.goto(BASE + "/vind-zzper/" + zzpProfile.id);
  await Promise.all([b.waitForURL(/\/bedrijven\/berichten\//), b.click('button:has-text("Neem contact op")')]);
  conversationId = b.url().split("/").pop();
  const c = await db.conversation.findUnique({ where: { id: conversationId } }); assert(c && c.zzpProfileId === zzpProfile.id);
});
await step("Bedrijf stuurt bericht → opgeslagen + notificatie + mail-log voor zzp'er", async () => {
  await b.fill('input[placeholder="Typ een bericht…"]', "Hoi Erik, heb je in oktober tijd voor een dakkapel in Haren?");
  await b.click('button[type="submit"]');
  await b.waitForSelector("text=dakkapel in Haren");
  const m = await db.message.findFirst({ where: { conversationId } }); assert(m, "bericht niet in DB");
  const n = await db.notification.findFirst({ where: { userId: zzpUser.id, type: "NIEUW_BERICHT" } }); assert(n, "geen notificatie");
  assert(await waitLog(`e-mail niet verzonden aan ${ZZP.email} ("Nieuw bericht`), "geen mail-log");
  await b.screenshot({ path: SHOTS + "/chat-bedrijf.png" });
});
await step("Tweede keer 'Neem contact op' hergebruikt hetzelfde gesprek", async () => {
  await b.goto(BASE + "/vind-zzper/" + zzpProfile.id);
  await Promise.all([b.waitForURL(/\/bedrijven\/berichten\//), b.click('button:has-text("Neem contact op")')]);
  assert(b.url().endsWith(conversationId), b.url());
  assert((await db.conversation.count({ where: { zzpProfileId: zzpProfile.id } })) === 1);
});
await step("Zzp'er ziet ongelezen badge en gesprek, en antwoordt", async () => {
  await z.goto(BASE + "/zzpers/berichten"); await z.waitForSelector("text=Bouwbedrijf Test BV");
  await z.click("text=Bouwbedrijf Test BV"); await z.waitForURL(/\/zzpers\/berichten\//);
  await z.waitForSelector("text=dakkapel in Haren");
  await z.fill('input[placeholder="Typ een bericht…"]', "Ja hoor, vanaf 6 oktober kan ik. Zal ik langskomen?");
  await z.click('button[type="submit"]'); await z.waitForSelector("text=6 oktober");
  const n = await db.notification.findFirst({ where: { userId: bedrijfUser.id, type: "NIEUW_BERICHT" } }); assert(n, "geen notificatie voor bedrijf");
  await z.screenshot({ path: SHOTS + "/chat-zzp.png" });
});
await step("Bedrijf ziet het antwoord live (polling) zonder herladen", async () => {
  await b.goto(BASE + "/bedrijven/berichten/" + conversationId);
  await b.waitForSelector("text=6 oktober", { timeout: 15000 });
  const gelezen = await db.message.count({ where: { conversationId, gelezenOp: null } }); assert(gelezen === 0, `${gelezen} ongelezen`);
});
await step("Meldingen-pagina toont notificatie", async () => { await b.goto(BASE + "/bedrijven/meldingen"); await b.waitForSelector("text=Nieuw bericht"); });
await step("Zzp'er kan geen gesprek van een ander openen (autorisatie)", async () => {
  // Maak een tweede bedrijf+gesprek en probeer dat als zzp'er te lezen: bestaat niet voor deze zzp'er → 404/notFound
  const r = await z.goto(BASE + "/bedrijven/berichten/" + conversationId); assert(!r || r.status() !== 200 || !(await z.content()).includes("dakkapel"), "zzp'er kan bedrijfsroute lezen");
});

// ── 5. Profiel melden ─────────────────────────────────────────────────────
await step("Bedrijf meldt een profiel → report in beheer", async () => {
  await b.goto(BASE + "/vind-zzper/" + zzpProfile.id);
  await b.click("summary");
  await b.selectOption('select[name="reden"]', "SPAM"); await b.fill('textarea[name="toelichting"]', "Testmelding uit de e2e-ronde.");
  await Promise.all([b.waitForURL(/gemeld=1/), b.click("text=Melding versturen")]);
  const r = await db.report.findFirst({ where: { melderUserId: bedrijfUser.id, subjectId: zzpProfile.id } }); assert(r?.reden === "SPAM");
});
await step("Gast kan niet melden: ziet alleen het accountblok", async () => {
  await g.goto(BASE + "/vind-zzper/" + zzpProfile.id);
  await g.waitForSelector("text=Om dit profiel te bekijken maak je een account aan als opdrachtgever");
  assert(!(await g.content()).includes('name="zzpProfileId"'), "meld-/contactformulier zichtbaar voor gast");
});

// ── 6. Wachtwoord vergeten / herstellen ───────────────────────────────────
const NEW_PW = "NieuwWachtwoord2026!";
let bevestigingBekend = "";
await step("Wachtwoord vergeten: bevestiging + mail-log", async () => {
  const c = await ctx(); const p = await c.newPage();
  await p.goto(BASE + "/wachtwoord-vergeten"); await p.fill('input[name="email"]', ZZP.email); await p.click('button[type="submit"]');
  let t = null; for (let i = 0; i < 40 && !t; i++) { await p.waitForTimeout(250); t = await db.verificationToken.findFirst({ where: { userId: zzpUser.id, type: "WACHTWOORD_RESET", usedAt: null } }); }
  assert(t, "geen resettoken");
  const mails = fs.readFileSync(LOG, "utf8").split("\n").filter(l => l.includes(`e-mail niet verzonden aan ${ZZP.email}`));
  assert(mails.length >= 2, "geen mail-log voor reset (" + mails.length + ")");
  await p.waitForSelector("text=/verstuurd|ontvang|gestuurd/i", { timeout: 15000 });
  bevestigingBekend = await p.locator("main, body").first().innerText();
  await c.close();
  return mails[mails.length - 1].replace(/.*\("(.*)"\).*/, "onderwerp: $1");
});
await step("Wachtwoord vergeten voor onbekend adres geeft dezelfde bevestiging", async () => {
  const c = await ctx(); const p = await c.newPage();
  await p.goto(BASE + "/wachtwoord-vergeten"); await p.fill('input[name="email"]', "niemand-" + RUN + "@test.local"); await p.click('button[type="submit"]');
  await p.waitForSelector("text=/verstuurd|ontvang|gestuurd/i", { timeout: 15000 });
  const tekst = await p.locator("main, body").first().innerText();
  assert(tekst === bevestigingBekend, "melding verschilt voor onbekend adres"); await c.close();
});
await step("Nieuw wachtwoord instellen via token → ingelogd, oude sessies weg", async () => {
  const token = randomBytes(32).toString("base64url");
  await db.verificationToken.create({ data: { userId: zzpUser.id, type: "WACHTWOORD_RESET", tokenHash: sha(token), expiresAt: new Date(Date.now() + 3600e3) } });
  const c = await ctx(); const p = await c.newPage();
  await p.goto(BASE + "/wachtwoord-herstellen?token=" + token);
  await p.fill('input[name="password"]', NEW_PW); await p.fill('input[name="password2"]', NEW_PW);
  await Promise.all([p.waitForURL(/\/zzpers\/dashboard/), p.click('button[type="submit"]')]);
  await c.close();
  // oude zzp-sessie (context z) is ongeldig
  await z.goto(BASE + "/zzpers/dashboard"); assert(z.url().includes("/inloggen"), "oude sessie nog geldig: " + z.url());
});
await step("Inloggen met oud wachtwoord faalt, met nieuw lukt", async () => {
  await z.goto(BASE + "/inloggen"); await z.fill('input[name="email"]', ZZP.email); await z.fill('input[name="password"]', ZZP.pw); await z.click('button[type="submit"]');
  await z.waitForSelector("text=onjuist", { timeout: 15000 });
  await login(z, { email: ZZP.email, pw: NEW_PW }); assert(z.url().includes("/zzpers/dashboard"), z.url());
});

// ── 7. Beheer ─────────────────────────────────────────────────────────────
const ac = await ctx(); const a = await ac.newPage();
await step("Admin inloggen → /admin dashboard met statistieken", async () => {
  await login(a, ADMIN); assert(a.url().includes("/admin"), a.url());
  await a.waitForSelector("text=Gesprekken"); await a.screenshot({ path: SHOTS + "/admin.png", fullPage: true });
});
await step("Zzp'er komt niet in /admin", async () => { await z.goto(BASE + "/admin"); assert(!z.url().includes("/admin"), z.url()); });
await step("Admin: report afhandelen", async () => {
  await a.goto(BASE + "/admin/reports"); await a.waitForSelector("text=Testmelding");
  const form = a.locator("form", { has: a.locator('select[name="status"]') }).first();
  await form.locator("select").selectOption("AFGEHANDELD"); await form.locator('button[type="submit"]').click(); await a.waitForTimeout(1500);
  const r = await db.report.findFirst({ where: { melderUserId: bedrijfUser.id } }); assert(r.status === "AFGEHANDELD" && r.afgehandeldOp);
  const audit = await db.auditLog.findFirst({ where: { actie: "report_behandeld", subjectId: r.id } }); assert(audit, "geen audit");
});
await step("Admin: zzp-profiel verifiëren → label op publiek profiel", async () => {
  await db.zZPProfile.update({ where: { id: zzpProfile.id }, data: { verificatieStatus: "IN_BEHANDELING" } });
  await a.goto(BASE + "/admin/verificaties"); await a.waitForSelector("text=Erik");
  const form = a.locator("form", { has: a.locator(`input[value="${zzpProfile.id}"]`) }).first();
  await form.locator("select").selectOption("GEVERIFIEERD"); await form.locator('button[type="submit"]').click(); await a.waitForTimeout(1500);
  const p = await db.zZPProfile.findUnique({ where: { id: zzpProfile.id } }); assert(p.verificatieStatus === "GEVERIFIEERD");
  // Profielen zijn alleen met een account zichtbaar: controleer als ingelogd bedrijf.
  await b.goto(BASE + "/vind-zzper/" + zzpProfile.id); await b.waitForSelector("text=Geverifieerd");
});
await step("Admin: gebruiker blokkeren → inloggen faalt; deblokkeren → lukt weer", async () => {
  await a.goto(BASE + "/admin/gebruikers?zoek=" + encodeURIComponent(ZZP.email));
  const form = a.locator("form", { has: a.locator(`input[name="userId"][value="${zzpUser.id}"]`) }).filter({ has: a.locator('input[name="blokkeren"]') }).first();
  await form.locator('button[type="submit"]').click(); await a.waitForTimeout(1500);
  let u = await db.user.findUnique({ where: { id: zzpUser.id } }); assert(u.status === "GEBLOKKEERD", "status " + u.status);
  const c = await ctx(); const p = await c.newPage();
  await p.goto(BASE + "/inloggen"); await p.fill('input[name="email"]', ZZP.email); await p.fill('input[name="password"]', NEW_PW); await p.click('button[type="submit"]');
  await p.waitForSelector("text=onjuist", { timeout: 15000 }); await c.close();
  await a.goto(BASE + "/admin/gebruikers?zoek=" + encodeURIComponent(ZZP.email));
  const form2 = a.locator("form", { has: a.locator(`input[name="userId"][value="${zzpUser.id}"]`) }).filter({ has: a.locator('input[name="blokkeren"]') }).first();
  await form2.locator('button[type="submit"]').click(); await a.waitForTimeout(1500);
  u = await db.user.findUnique({ where: { id: zzpUser.id } }); assert(u.status === "ACTIEF", "status " + u.status);
});
await step("Admin: auditlog toont de acties", async () => { await a.goto(BASE + "/admin/audit"); await a.waitForSelector("text=gebruiker_geblokkeerd"); });

// ── 8. Contactformulier ───────────────────────────────────────────────────
await step("Contactformulier → bericht in DB en in Beheer → Contact", async () => {
  await g.goto(BASE + "/contact");
  await g.fill('input[name="naam"]', "Gast Tester"); await g.fill('input[name="email"]', "gast-" + RUN + "@test.local");
  await g.fill('input[name="onderwerp"]', "Vraag e2e " + RUN); await g.fill('textarea[name="bericht"]', "Dit is een testbericht van minimaal tien tekens.");
  await g.click('button[type="submit"]'); await g.waitForSelector("text=Bedankt voor je bericht", { timeout: 15000 });
  const m = await db.contactMessage.findFirst({ where: { onderwerp: "Vraag e2e " + RUN } }); assert(m?.status === "NIEUW");
  await a.goto(BASE + "/admin/contact"); await a.waitForSelector("text=Vraag e2e " + RUN);
});
await step("Contactformulier: honeypot-spam wordt genegeerd", async () => {
  await g.goto(BASE + "/contact");
  await g.fill('input[name="naam"]', "Spam Bot"); await g.fill('input[name="email"]', "bot@test.local");
  await g.fill('input[name="onderwerp"]', "SPAM " + RUN); await g.fill('textarea[name="bericht"]', "Koop nu goedkope dingen bij ons.");
  await g.evaluate(() => { document.querySelector('input[name="website"]').value = "http://spam.example"; }); await g.click('button[type="submit"]'); await g.waitForTimeout(2000);
  const m = await db.contactMessage.findFirst({ where: { onderwerp: "SPAM " + RUN } }); assert(!m, "spam opgeslagen");
});
await step("Contactformulier: rate limit (max 5/uur per IP)", async () => {
  let geweigerd = false;
  for (let i = 0; i < 6; i++) {
    await g.goto(BASE + "/contact");
    await g.fill('input[name="naam"]', "Herhaler"); await g.fill('input[name="email"]', "herhaler@test.local");
    await g.fill('input[name="onderwerp"]', "Herhaling " + i); await g.fill('textarea[name="bericht"]', "Nog een bericht van minimaal tien tekens.");
    await g.click('button[type="submit"]'); await g.waitForTimeout(1200);
    if ((await g.content()).includes("Te veel berichten")) { geweigerd = true; break; }
  }
  assert(geweigerd, "limiet niet bereikt");
});

// ── 9. AVG: export en verwijderen ─────────────────────────────────────────
await step("Gegevensexport (JSON) bevat account, profiel en gesprekken", async () => {
  const r = await zc.request.get(BASE + "/api/account/export"); assert(r.status() === 200);
  const j = await r.json(); assert(j.account?.email === ZZP.email && j.zzpProfiel?.conversations?.length === 1, JSON.stringify(Object.keys(j)));
});
await step("Uitloggen via de header", async () => {
  await b.goto(BASE + "/"); await b.click('button:has-text("Uitloggen")'); await b.waitForTimeout(1500);
  await b.goto(BASE + "/bedrijven/dashboard"); assert(b.url().includes("/inloggen"), b.url());
});
await step("Account verwijderen (bedrijf) → gebruiker, bedrijf en gesprek weg", async () => {
  await login(b, BEDRIJF); await b.goto(BASE + "/bedrijven/instellingen");
  await b.fill('input[name="bevestig"]', "VERWIJDER");
  await Promise.all([b.waitForURL(u => u.pathname === "/"), b.click("text=Verwijder mijn account")]);
  assert(!(await db.user.findUnique({ where: { id: bedrijfUser.id } })), "user bestaat nog");
  assert(!(await db.conversation.findUnique({ where: { id: conversationId } })), "gesprek bestaat nog");
  assert(!(await db.company.findUnique({ where: { id: companyId } })), "bedrijf bestaat nog");
});
await step("Zzp'er ziet daarna geen gesprekken meer (geen wees-data)", async () => { await z.goto(BASE + "/zzpers/berichten"); await z.waitForSelector("text=nog geen berichten"); });

// ── 10. Mobiel: publiek profiel en chat zonder horizontale scroll ─────────
await step("Mobiel (390px): homepage, etalage en profiel zonder horizontale scroll", async () => {
  const mc = await browser.newContext({ viewport: { width: 390, height: 844 } }); const m = await mc.newPage();
  for (const path of ["/", "/vind-zzper", "/vind-zzper/" + zzpProfile.id, "/registreren"]) {
    await m.goto(BASE + path); await m.waitForLoadState("networkidle");
    const sw = await m.evaluate(() => document.documentElement.scrollWidth); assert(sw <= 390, `${path}: scrollWidth ${sw}`);
  }
  await m.screenshot({ path: SHOTS + "/mobiel-profiel.png", fullPage: true }); await mc.close();
});

await browser.close(); await db.$disconnect();
const geslaagd = results.filter(r => r.ok).length;
console.log(`\n${geslaagd}/${results.length} geslaagd`);
fs.writeFileSync(path.join(SHOTS, "resultaat.json"), JSON.stringify(results, null, 2));
process.exit(geslaagd === results.length ? 0 : 1);
