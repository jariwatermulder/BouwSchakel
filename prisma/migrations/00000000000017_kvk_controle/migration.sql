-- KvK-controle: bij een geslaagde controle in het Handelsregister bewaren we
-- de gevonden bedrijfsnaam en het tijdstip, zodat beheerders het kunnen zien.
ALTER TABLE "ZZPProfile" ADD COLUMN "kvkNaam" TEXT;
ALTER TABLE "ZZPProfile" ADD COLUMN "kvkGecontroleerdOp" TIMESTAMP(3);
ALTER TABLE "Company" ADD COLUMN "kvkNaam" TEXT;
ALTER TABLE "Company" ADD COLUMN "kvkGecontroleerdOp" TIMESTAMP(3);
