-- Migration pour ajouter les champs d'onboarding détaillés aux organisations
-- Date: 2025-09-21
-- Description: Ajoute les champs nécessaires pour l'onboarding complet des structures d'accompagnement

-- Ajouter les champs d'onboarding manquants à la table organizations
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS founded_year integer,
ADD COLUMN IF NOT EXISTS mission text,
ADD COLUMN IF NOT EXISTS vision text,
ADD COLUMN IF NOT EXISTS values jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS sectors jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS stages jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS geographic_focus jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS team_size integer,
ADD COLUMN IF NOT EXISTS specializations jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS methodology text,
ADD COLUMN IF NOT EXISTS program_duration_months integer,
ADD COLUMN IF NOT EXISTS success_criteria text,
ADD COLUMN IF NOT EXISTS support_types jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_direct_applications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0;

-- Mettre à jour les types existants pour inclure plus d'options
ALTER TABLE public.organizations 
DROP CONSTRAINT IF EXISTS organizations_type_check;

ALTER TABLE public.organizations 
ADD CONSTRAINT organizations_type_check 
CHECK (type = ANY (ARRAY[
  'incubator'::text, 
  'accelerator'::text, 
  'venture_capital'::text,
  'corporate'::text,
  'university'::text,
  'government'::text,
  'business_school'::text,
  'chamber_commerce'::text,
  'consulting'::text,
  'coworking'::text,
  'other'::text
]));

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_organizations_onboarding_completed ON public.organizations(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON public.organizations(type);
CREATE INDEX IF NOT EXISTS idx_organizations_is_public ON public.organizations(is_public);
CREATE INDEX IF NOT EXISTS idx_organizations_allow_direct_applications ON public.organizations(allow_direct_applications);

-- Créer une vue pour les organisations publiques
CREATE OR REPLACE VIEW public.public_organizations AS
SELECT 
  id,
  name,
  type,
  description,
  founded_year,
  website,
  email,
  phone,
  address,
  logo_url,
  mission,
  vision,
  values,
  sectors,
  stages,
  geographic_focus,
  team_size,
  specializations,
  social_media,
  created_at,
  updated_at
FROM public.organizations
WHERE is_public = true AND onboarding_completed = true;

-- Politique RLS pour la vue publique
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Permettre la lecture publique des organisations publiques
CREATE POLICY "Public organizations are viewable by everyone" ON public.organizations
  FOR SELECT USING (is_public = true AND onboarding_completed = true);

-- Permettre aux créateurs et staff de leur organisation de voir et modifier leurs données
CREATE POLICY "Organization creators and staff can view and edit their organization" ON public.organizations
  FOR ALL USING (
    auth.uid() = created_by OR 
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE organization_id = organizations.id 
      AND user_role IN ('organisation', 'staff')
    )
  );

-- Commentaires pour documenter les nouveaux champs
COMMENT ON COLUMN public.organizations.description IS 'Description détaillée de l''organisation';
COMMENT ON COLUMN public.organizations.founded_year IS 'Année de création de l''organisation';
COMMENT ON COLUMN public.organizations.mission IS 'Mission de l''organisation';
COMMENT ON COLUMN public.organizations.vision IS 'Vision de l''organisation';
COMMENT ON COLUMN public.organizations.values IS 'Valeurs de l''organisation (array JSON)';
COMMENT ON COLUMN public.organizations.sectors IS 'Secteurs d''activité ciblés (array JSON)';
COMMENT ON COLUMN public.organizations.stages IS 'Stades d''investissement ou de développement ciblés (array JSON)';
COMMENT ON COLUMN public.organizations.geographic_focus IS 'Zones géographiques d''intervention (array JSON)';
COMMENT ON COLUMN public.organizations.team_size IS 'Taille de l''équipe';
COMMENT ON COLUMN public.organizations.specializations IS 'Spécialisations de l''organisation (array JSON)';
COMMENT ON COLUMN public.organizations.methodology IS 'Méthodologie d''accompagnement';
COMMENT ON COLUMN public.organizations.program_duration_months IS 'Durée moyenne des programmes en mois';
COMMENT ON COLUMN public.organizations.success_criteria IS 'Critères de succès utilisés';
COMMENT ON COLUMN public.organizations.support_types IS 'Types de support offerts (array JSON)';
COMMENT ON COLUMN public.organizations.social_media IS 'Liens réseaux sociaux (object JSON)';
COMMENT ON COLUMN public.organizations.is_public IS 'Si l''organisation est visible publiquement';
COMMENT ON COLUMN public.organizations.allow_direct_applications IS 'Si l''organisation accepte les candidatures directes';
COMMENT ON COLUMN public.organizations.onboarding_completed IS 'Si l''onboarding a été complété';
COMMENT ON COLUMN public.organizations.onboarding_step IS 'Étape actuelle de l''onboarding (0 = non commencé)';