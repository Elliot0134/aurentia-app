-- Migration temporaire pour déboguer les adhérents
-- Cette migration ajoute une politique RLS plus permissive pour les tests

-- Ajouter une politique temporaire pour permettre l'accès aux user_organizations
-- pour les utilisateurs connectés (à supprimer après debug)
CREATE POLICY IF NOT EXISTS "Temporary debug access for user_organizations" ON public.user_organizations
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Commentaire pour se rappeler de supprimer cette politique
COMMENT ON POLICY "Temporary debug access for user_organizations" ON public.user_organizations 
IS 'TEMPORARY POLICY - Remove after debugging member access issues';