-- Migration pour ajouter les couleurs personnalisées des types d'événements
-- Date: 2025-01-24

-- Ajouter un champ pour stocker les couleurs personnalisées des types d'événements
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS event_type_colors JSONB DEFAULT '{
  "workshop": "#ff5932",
  "meeting": "#6366f1", 
  "webinar": "#8b5cf6",
  "networking": "#06b6d4",
  "presentation": "#f59e0b",
  "training": "#10b981",
  "other": "#64748b"
}';

-- Commentaire pour documenter le champ
COMMENT ON COLUMN public.organizations.event_type_colors IS 'Couleurs personnalisées pour chaque type d''événement au format JSON';

-- Mettre à jour les organisations existantes avec les couleurs par défaut si elles n'en ont pas
UPDATE public.organizations 
SET event_type_colors = '{
  "workshop": "#ff5932",
  "meeting": "#6366f1", 
  "webinar": "#8b5cf6",
  "networking": "#06b6d4",
  "presentation": "#f59e0b",
  "training": "#10b981",
  "other": "#64748b"
}'
WHERE event_type_colors IS NULL;

-- Fonction pour valider le format des couleurs
CREATE OR REPLACE FUNCTION validate_event_type_colors(colors JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que tous les types d'événements requis sont présents
  IF NOT (colors ? 'workshop' AND colors ? 'meeting' AND colors ? 'webinar' 
          AND colors ? 'networking' AND colors ? 'presentation' 
          AND colors ? 'training' AND colors ? 'other') THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier que les valeurs sont des chaînes de caractères (couleurs hex)
  IF NOT (jsonb_typeof(colors->'workshop') = 'string' 
          AND jsonb_typeof(colors->'meeting') = 'string'
          AND jsonb_typeof(colors->'webinar') = 'string'
          AND jsonb_typeof(colors->'networking') = 'string'
          AND jsonb_typeof(colors->'presentation') = 'string'
          AND jsonb_typeof(colors->'training') = 'string'
          AND jsonb_typeof(colors->'other') = 'string') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Contrainte pour valider le format des couleurs
ALTER TABLE public.organizations 
ADD CONSTRAINT check_event_type_colors_format 
CHECK (validate_event_type_colors(event_type_colors));

-- Index pour optimiser les requêtes sur les couleurs
CREATE INDEX IF NOT EXISTS idx_organizations_event_type_colors 
ON public.organizations USING GIN (event_type_colors);