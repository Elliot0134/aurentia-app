-- Migration pour ajouter organization_id à form_business_idea
-- Cette migration permet de lier un projet à une organisation lors de sa création

-- Ajouter la colonne organization_id (nullable pour compatibilité avec projets existants)
ALTER TABLE public.form_business_idea 
ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Ajouter un index pour optimiser les requêtes
CREATE INDEX idx_form_business_idea_organization_id ON public.form_business_idea(organization_id);

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN public.form_business_idea.organization_id IS 'Organisation à laquelle le projet est lié (optionnel)';

-- Optionnel : Mettre à jour les projets existants de membres pour les lier à leur organisation
-- Cette partie peut être exécutée séparément si besoin
UPDATE public.form_business_idea 
SET organization_id = (
    SELECT p.organization_id 
    FROM public.profiles p 
    WHERE p.id = form_business_idea.user_id 
    AND p.organization_id IS NOT NULL
    AND p.user_role = 'member'
)
WHERE organization_id IS NULL
AND user_id IN (
    SELECT id 
    FROM public.profiles 
    WHERE user_role = 'member' 
    AND organization_id IS NOT NULL
);