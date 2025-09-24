-- Politique RLS temporaire pour déboguer
-- ATTENTION: Cette politique est permissive, à supprimer après debug

-- Créer une politique temporaire pour user_organizations
DROP POLICY IF EXISTS "temp_debug_user_organizations" ON public.user_organizations;
CREATE POLICY "temp_debug_user_organizations" ON public.user_organizations
  FOR SELECT USING (true); -- Très permissif pour debug

-- Vérifier les politiques existantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_organizations';

-- Si besoin, faire pareil pour profiles
-- DROP POLICY IF EXISTS "temp_debug_profiles" ON public.profiles;
-- CREATE POLICY "temp_debug_profiles" ON public.profiles
--   FOR SELECT USING (true);