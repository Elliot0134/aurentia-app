-- Migration pour optimiser les paramètres d'organisation
-- Date: 2025-09-22

-- Vérifier que la colonne settings existe et a une structure par défaut cohérente
UPDATE organizations 
SET settings = COALESCE(settings, '{}')
WHERE settings IS NULL;

-- Mettre à jour les paramètres par défaut pour les organisations existantes qui n'ont pas de settings complets
UPDATE organizations 
SET settings = jsonb_set(
  jsonb_set(
    COALESCE(settings, '{}'),
    '{branding}',
    jsonb_build_object(
      'primaryColor', COALESCE(primary_color, '#ff5932'),
      'secondaryColor', COALESCE(secondary_color, '#1a1a1a'),
      'whiteLabel', false
    )
  ),
  '{notifications}',
  jsonb_build_object(
    'emailNotifications', true,
    'projectUpdates', true,
    'mentorAssignments', true,
    'weeklyReports', false,
    'systemAlerts', true
  )
)
WHERE NOT (settings ? 'branding' AND settings ? 'notifications');

-- Ajouter un index sur la colonne settings pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_organizations_settings ON organizations USING gin (settings);

-- Ajouter une contrainte pour s'assurer que les couleurs sont des codes hexadécimaux valides
ALTER TABLE organizations 
ADD CONSTRAINT check_primary_color_format 
CHECK (primary_color IS NULL OR primary_color ~ '^#[0-9A-Fa-f]{6}$');

ALTER TABLE organizations 
ADD CONSTRAINT check_secondary_color_format 
CHECK (secondary_color IS NULL OR secondary_color ~ '^#[0-9A-Fa-f]{6}$');

-- Commenter les colonnes pour clarifier leur usage
COMMENT ON COLUMN organizations.settings IS 'Paramètres de configuration JSON pour l''organisation (branding, notifications, etc.)';
COMMENT ON COLUMN organizations.primary_color IS 'Couleur principale de l''organisation (format hexadécimal)';
COMMENT ON COLUMN organizations.secondary_color IS 'Couleur secondaire de l''organisation (format hexadécimal)';