/**
 * Seed-script (development).
 *
 * Belangrijk: seed data mag NOOIT in productie terechtkomen. Dit script weigert
 * te draaien wanneer NODE_ENV === "production". De catalogus (vakgebieden,
 * specialisaties, certificaten) is idempotent (upsert op slug) en vormt de
 * basis voor de ZZP-registratie en matching. Realistische demo-profielen en
 * -opdrachten worden in latere fasen toegevoegd, duidelijk gemarkeerd als seed.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/gu, "")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/(^-|-$)/gu, "");
}

const VAKGEBIEDEN: { naam: string; specialisaties: string[] }[] = [
  {
    naam: "Timmerman",
    specialisaties: ["Kozijnen", "Aftimmerwerk", "Dakkapellen", "Renovatie"],
  },
  {
    naam: "Metselaar",
    specialisaties: ["Voegwerk", "Gevelmetselwerk", "Restauratie"],
  },
  {
    naam: "Tegelzetter",
    specialisaties: ["Wandtegels", "Vloertegels", "Natuursteen"],
  },
  {
    naam: "Schilder",
    specialisaties: ["Binnenschilderwerk", "Buitenschilderwerk", "Spuitwerk"],
  },
  {
    naam: "Stukadoor",
    specialisaties: ["Sierpleister", "Spachtelputz", "Gladpleisteren"],
  },
  {
    naam: "Loodgieter",
    specialisaties: ["Sanitair", "Dakgoten", "Waterleidingen"],
  },
  {
    naam: "Elektricien",
    specialisaties: ["Groepenkast", "Bekabeling", "Domotica"],
  },
  { naam: "Installateur", specialisaties: ["CV", "Warmtepomp", "Ventilatie"] },
  { naam: "Dakdekker", specialisaties: ["Bitumen", "EPDM", "Pannendak"] },
  {
    naam: "Grondwerker",
    specialisaties: ["Ontgraven", "Bestrating", "Riolering"],
  },
  {
    naam: "Stratenmaker",
    specialisaties: ["Sierbestrating", "Klinkers", "Opsluitbanden"],
  },
  { naam: "Sloper", specialisaties: ["Handmatig slopen", "Asbestsanering"] },
  { naam: "Betontimmerman", specialisaties: ["Bekisting", "Wapening"] },
  { naam: "Voorman", specialisaties: [] },
  { naam: "Uitvoerder", specialisaties: [] },
  // Techniek & installatie
  { naam: "Monteur", specialisaties: ["Werktuigbouw", "Elektromechanica", "Machineonderhoud"] },
  { naam: "Servicetechnicus", specialisaties: ["Koeltechniek", "Liften", "Zonnepanelen"] },
  { naam: "Lasser", specialisaties: ["MIG/MAG", "TIG", "Elektrode"] },
  // Schoonmaak
  { naam: "Schoonmaker", specialisaties: ["Kantoorschoonmaak", "Woningschoonmaak", "Glasbewassing"] },
  { naam: "Specialistische reiniging", specialisaties: ["Vloeronderhoud", "Gevelreiniging", "Dieptereiniging"] },
  // Transport & logistiek
  { naam: "Chauffeur", specialisaties: ["Bestelbus (B)", "Vrachtwagen (C)", "Bus (D)", "Koeriersdienst"] },
  { naam: "Bezorger", specialisaties: ["Pakketten", "Maaltijden"] },
  { naam: "Heftruckchauffeur", specialisaties: [] },
  { naam: "Magazijnmedewerker", specialisaties: ["Orderpicken", "Voorraadbeheer"] },
  // Groen & buiten
  { naam: "Hovenier", specialisaties: ["Aanleg", "Onderhoud", "Boomverzorging"] },
  // Horeca
  { naam: "Kok", specialisaties: ["Zelfstandig werkend kok", "Chef-kok", "Fastfood"] },
  { naam: "Bediening", specialisaties: ["Gastheer/-vrouw", "Barista", "Barpersoneel"] },
  { naam: "Keukenhulp", specialisaties: [] },
  // Zorg & welzijn
  { naam: "Verzorgende IG", specialisaties: [] },
  { naam: "Verpleegkundige", specialisaties: ["Wijkverpleging", "Ziekenhuis", "Ouderenzorg"] },
  { naam: "Begeleider", specialisaties: ["Gehandicaptenzorg", "Jeugdzorg", "GGZ"] },
  // ICT & digitaal
  { naam: "Softwareontwikkelaar", specialisaties: ["Frontend", "Backend", "Fullstack"] },
  { naam: "Systeembeheerder", specialisaties: ["Netwerkbeheer", "Cloud", "Support"] },
  { naam: "Data-analist", specialisaties: [] },
  // Administratie & office
  { naam: "Administratief medewerker", specialisaties: ["Boekhouding", "Facturatie", "Salarisadministratie"] },
  { naam: "Secretaresse", specialisaties: [] },
  { naam: "Klantenservicemedewerker", specialisaties: [] },
  // Creatief & marketing
  { naam: "Grafisch vormgever", specialisaties: ["Print", "Digitaal", "Branding"] },
  { naam: "Fotograaf / videograaf", specialisaties: [] },
  { naam: "Online marketeer", specialisaties: ["SEO/SEA", "Social media", "E-mailmarketing"] },
  // Evenementen & beveiliging
  { naam: "Beveiliger", specialisaties: ["Objectbeveiliging", "Evenementbeveiliging"] },
  { naam: "Evenementmedewerker", specialisaties: ["Op- en afbouw", "Hostess/host"] },
];

const CERTIFICATEN = [
  "VCA Basis",
  "VCA VOL",
  "BHV",
  "Heftruckcertificaat",
  "Hoogwerker",
  "Asbest herkennen",
  // Sector-breed
  "Rijbewijs B",
  "Rijbewijs C",
  "Rijbewijs D",
  "Code 95",
  "Reachtruckcertificaat",
  "HACCP",
  "SVH Sociale Hygiëne",
  "Beveiligingsdiploma (Beveiliger 2)",
  "BIG-registratie",
  "EHBO",
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed wordt niet uitgevoerd in productie.");
  }

  for (const vak of VAKGEBIEDEN) {
    const skill = await db.skill.upsert({
      where: { slug: slugify(vak.naam) },
      update: { naam: vak.naam },
      create: { naam: vak.naam, slug: slugify(vak.naam) },
    });
    for (const spec of vak.specialisaties) {
      await db.specialization.upsert({
        where: { skillId_slug: { skillId: skill.id, slug: slugify(spec) } },
        update: { naam: spec },
        create: { skillId: skill.id, naam: spec, slug: slugify(spec) },
      });
    }
  }

  for (const cert of CERTIFICATEN) {
    await db.certification.upsert({
      where: { slug: slugify(cert) },
      update: { naam: cert },
      create: { naam: cert, slug: slugify(cert) },
    });
  }

  // Standaard matching-instellingen (bewerkbaar via admin in FASE 7).
  await db.matchingSetting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  // Optionele admin-bootstrap: alleen wanneer ADMIN_EMAIL + ADMIN_PASSWORD
  // gezet zijn. Zie docs/ADMIN.md voor het promoveren van een bestaand account.
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await db.user.upsert({
      where: { email: adminEmail },
      update: { role: "ADMIN", adminRole: "SUPER_ADMIN" },
      create: {
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
        adminRole: "SUPER_ADMIN",
        emailVerifiedAt: new Date(),
      },
    });
    console.info(`Admin klaar: ${adminEmail}`);
  }

  const skillCount = await db.skill.count();
  const certCount = await db.certification.count();
  console.info(
    `Seed klaar: ${skillCount} vakgebieden, ${certCount} certificaten.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
