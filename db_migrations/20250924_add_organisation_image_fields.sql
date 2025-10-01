-- Migration: Add image url/path fields to organizations table
-- Adds columns for logo and banner URLs and storage paths if they don't exist

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS logo_path text,
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS banner_path text;

-- Backfill: If there's an existing `logo` column used previously, copy its value to logo_url
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='logo') THEN
    UPDATE public.organizations SET logo_url = COALESCE(logo_url, logo);
  END IF;
END$$;

COMMENT ON COLUMN public.organizations.logo_url IS 'Public URL to logo stored in Supabase Storage (organisation-logo bucket)';
COMMENT ON COLUMN public.organizations.logo_path IS 'Storage path inside the bucket for the logo file';
COMMENT ON COLUMN public.organizations.banner_url IS 'Public URL to banner stored in Supabase Storage (organisation-banner bucket)';
COMMENT ON COLUMN public.organizations.banner_path IS 'Storage path inside the bucket for the banner file';
