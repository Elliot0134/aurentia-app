-- Create audio storage bucket and audio recordings table
-- This migration creates the infrastructure for speech-to-text audio recordings

-- =====================================================
-- 1. CREATE AUDIO STORAGE BUCKET
-- =====================================================

-- Bucket for audio recordings (MP3 format)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-recordings',
  'audio-recordings',
  false,
  10485760, -- 10 MB in bytes
  ARRAY[
    'audio/mpeg',
    'audio/mp3',
    'audio/webm',
    'audio/wav',
    'audio/ogg',
    'audio/x-m4a'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. CREATE AUDIO TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  storage_path text NOT NULL, -- Path in Supabase Storage bucket
  file_name text NOT NULL,
  file_size integer, -- Size in bytes
  duration_seconds numeric(10, 2), -- Audio duration
  transcribed_text text, -- Text returned by Whisper/n8n
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text, -- If transcription failed
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_audio_user_id ON public.audio(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_project_id ON public.audio(project_id);
CREATE INDEX IF NOT EXISTS idx_audio_created_at ON public.audio(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audio_status ON public.audio(status);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_audio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audio_updated_at_trigger
  BEFORE UPDATE ON public.audio
  FOR EACH ROW
  EXECUTE FUNCTION update_audio_updated_at();

-- =====================================================
-- 3. RLS POLICIES FOR AUDIO TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE public.audio ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own audio recordings
CREATE POLICY "Users can insert their own audio recordings"
ON public.audio FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own audio recordings
CREATE POLICY "Users can view their own audio recordings"
ON public.audio FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can update their own audio recordings
CREATE POLICY "Users can update their own audio recordings"
ON public.audio FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own audio recordings
CREATE POLICY "Users can delete their own audio recordings"
ON public.audio FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Organization staff can view member audio recordings
CREATE POLICY "Organization staff can view member audio recordings"
ON public.audio FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_organizations uo1
    JOIN user_organizations uo2 ON uo1.organization_id = uo2.organization_id
    WHERE uo1.user_id = auth.uid()
    AND uo2.user_id = audio.user_id
    AND uo1.user_role IN ('organisation', 'staff')
    AND uo1.status = 'active'
  )
);

-- =====================================================
-- 4. RLS POLICIES FOR AUDIO STORAGE BUCKET
-- =====================================================

-- Policy: Users can upload their own audio files
CREATE POLICY "Users can upload audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own audio files
CREATE POLICY "Users can view their own audio files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own audio files
CREATE POLICY "Users can delete their own audio files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 5. HELPER FUNCTION TO CLEAN UP OLD AUDIO FILES
-- =====================================================

-- Function to delete audio recordings older than 30 days
CREATE OR REPLACE FUNCTION cleanup_old_audio_recordings()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete records older than 30 days
  WITH deleted AS (
    DELETE FROM public.audio
    WHERE created_at < now() - INTERVAL '30 days'
    RETURNING storage_path
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cleanup_old_audio_recordings() TO authenticated;

COMMENT ON TABLE public.audio IS 'Stores metadata for audio recordings used in speech-to-text transcription';
COMMENT ON FUNCTION cleanup_old_audio_recordings() IS 'Deletes audio recordings older than 30 days to save storage space';
