-- ============================================
-- Migration: Add Onboarding Fields to Profiles
-- Date: 2025-01-22
-- Description: Adds fields to track onboarding completion and store user preferences
-- ============================================

-- Add onboarding-related fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_data JSONB,
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light',
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'fr';

-- Add index for faster queries on onboarding status
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);

-- Add comments for documentation
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether the user has completed the onboarding flow';
COMMENT ON COLUMN profiles.onboarding_data IS 'JSON data containing all onboarding responses';
COMMENT ON COLUMN profiles.theme_preference IS 'User preferred theme: light or dark';
COMMENT ON COLUMN profiles.preferred_language IS 'User preferred language code (e.g., fr, en, es)';

-- ============================================
-- OPTIONAL: RLS Policies (if not already set)
-- ============================================

-- Users can read their own profile
-- CREATE POLICY "Users can view own profile" ON profiles
--   FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
-- CREATE POLICY "Users can update own profile" ON profiles
--   FOR UPDATE USING (auth.uid() = id);
