-- Migration: Add avatar storage bucket and policies
-- Date: 2025-10-06
-- Description: Creates storage bucket for user avatars with proper policies

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS on storage.objects is already enabled by Supabase
-- No need to ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view avatars (public bucket)
DROP POLICY IF EXISTS "Public avatars are viewable by everyone" ON storage.objects;
CREATE POLICY "Public avatars are viewable by everyone"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Policy: Users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can update their own avatar
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete their own avatar
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to get avatar URL
CREATE OR REPLACE FUNCTION public.get_avatar_url(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avatar_path text;
BEGIN
  SELECT avatar_url INTO avatar_path
  FROM public.profiles
  WHERE id = user_id;

  IF avatar_path IS NULL OR avatar_path = '' THEN
    RETURN NULL;
  END IF;

  -- If it's already a full URL, return it
  IF avatar_path LIKE 'http%' THEN
    RETURN avatar_path;
  END IF;

  -- Otherwise, construct the Supabase storage URL
  RETURN format('https://%s/storage/v1/object/public/avatars/%s', 
    current_setting('app.supabase_url', true), 
    avatar_path
  );
END;
$$;

-- Function to update user avatar
CREATE OR REPLACE FUNCTION public.update_user_avatar(
  p_user_id uuid,
  p_avatar_url text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is updating their own avatar or is an admin
  IF auth.uid() != p_user_id AND NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND user_role IN ('super_admin', 'organisation')
  ) THEN
    RAISE EXCEPTION 'Unauthorized to update this avatar';
  END IF;

  UPDATE public.profiles
  SET 
    avatar_url = p_avatar_url,
    updated_at = now()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$;

-- Add comments
COMMENT ON FUNCTION public.get_avatar_url IS 'Gets the full public URL for a user avatar';
COMMENT ON FUNCTION public.update_user_avatar IS 'Updates a user avatar URL with permission checks';
