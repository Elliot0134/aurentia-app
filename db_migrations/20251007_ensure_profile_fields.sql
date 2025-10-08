-- Migration to ensure all required profile fields exist
-- This migration is idempotent and can be run multiple times safely

-- Add first_name if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'first_name') THEN
        ALTER TABLE public.profiles ADD COLUMN first_name text;
    END IF;
END $$;

-- Add last_name if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'last_name') THEN
        ALTER TABLE public.profiles ADD COLUMN last_name text;
    END IF;
END $$;

-- Add phone if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone text;
    END IF;
END $$;

-- Add location if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'location') THEN
        ALTER TABLE public.profiles ADD COLUMN location text;
    END IF;
END $$;

-- Add company if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'company') THEN
        ALTER TABLE public.profiles ADD COLUMN company text;
    END IF;
END $$;

-- Create an index on location for faster queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location);

-- Add a comment to document the fields
COMMENT ON COLUMN public.profiles.first_name IS 'User first name';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name';
COMMENT ON COLUMN public.profiles.phone IS 'User phone number';
COMMENT ON COLUMN public.profiles.location IS 'User location/address for organization discovery';
COMMENT ON COLUMN public.profiles.company IS 'User company name';
