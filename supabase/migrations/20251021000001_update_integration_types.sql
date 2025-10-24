-- =====================================================
-- Update Integration Types Constraint
-- Created: 2025-10-21
-- Description: Remove 'notion' and add 'google_drive', 'gmail'
-- =====================================================

-- Drop the old constraint
ALTER TABLE integrations
DROP CONSTRAINT IF EXISTS valid_integration_type;

-- Add the new constraint with updated integration types
ALTER TABLE integrations
ADD CONSTRAINT valid_integration_type CHECK (
  integration_type IN (
    'slack',
    'discord',
    'teams',
    'google_calendar',
    'trello',
    'google_drive',
    'gmail'
  )
);

-- Add comment
COMMENT ON CONSTRAINT valid_integration_type ON integrations IS
  'Allowed integration types: Slack, Discord, Teams, Google Calendar, Trello, Google Drive, Gmail';
