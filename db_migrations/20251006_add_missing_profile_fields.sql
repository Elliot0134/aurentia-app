-- Migration: Add missing profile fields for complete user profiles
-- Date: 2025-10-06
-- Description: Adds avatar_url, website, and ensures all necessary fields exist

-- Add missing fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS job_title text;

-- Update existing linkedin_url to ensure it exists
-- (It might already exist in some schemas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'linkedin_url'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN linkedin_url text;
    END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON public.profiles(avatar_url) WHERE avatar_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_website ON public.profiles(website) WHERE website IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_linkedin_url ON public.profiles(linkedin_url) WHERE linkedin_url IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user avatar/profile picture stored in Supabase Storage';
COMMENT ON COLUMN public.profiles.website IS 'Personal or professional website URL';
COMMENT ON COLUMN public.profiles.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN public.profiles.bio IS 'User biography/description';
COMMENT ON COLUMN public.profiles.location IS 'User location (city, country)';
COMMENT ON COLUMN public.profiles.company IS 'Current company or organization';
COMMENT ON COLUMN public.profiles.job_title IS 'Current job title or role';
