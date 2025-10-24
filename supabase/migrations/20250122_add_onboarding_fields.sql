-- Add onboarding-related fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_data JSONB,
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light',
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'fr';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);

-- Add comment for documentation
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether the user has completed the onboarding flow';
COMMENT ON COLUMN profiles.onboarding_data IS 'JSON data containing all onboarding responses';
COMMENT ON COLUMN profiles.theme_preference IS 'User preferred theme: light or dark';
COMMENT ON COLUMN profiles.preferred_language IS 'User preferred language code (e.g., fr, en, es)';
