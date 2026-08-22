-- Zet RLS aan op alle publieke tabellen. Zonder policies kan de publieke
-- Supabase/PostgREST-API (anon key) niets lezen of schrijven. De applicatie
-- verbindt via Prisma met de owner-rol, die RLS omzeilt. Zie docs/SECURITY.md.
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;
