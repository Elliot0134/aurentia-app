-- Create storage buckets for OrganisationRessources feature
-- This migration creates 3 buckets: images, files, and covers

-- =====================================================
-- 1. CREATE BUCKETS
-- =====================================================

-- Bucket for resource content images (ImageBlock)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-resources-images',
  'organization-resources-images',
  false,
  10485760, -- 10 MB in bytes
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Bucket for resource file attachments (FileBlock)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-resources-files',
  'organization-resources-files',
  false,
  52428800, -- 50 MB in bytes
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Bucket for resource cover images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-resources-covers',
  'organization-resources-covers',
  false,
  5242880, -- 5 MB in bytes
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. RLS POLICIES FOR organization-resources-images
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Organization members can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can view images" ON storage.objects;
DROP POLICY IF EXISTS "Organization admins can delete images" ON storage.objects;

-- Policy: Organization members can upload images
CREATE POLICY "Organization members can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-resources-images'
  AND auth.uid() IN (
    SELECT user_id FROM user_organizations
    WHERE organization_id = (storage.foldername(name))[1]::uuid
    AND user_role IN ('organisation', 'staff')
    AND status = 'active'
  )
);

-- Policy: Organization members can view images
CREATE POLICY "Organization members can view images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'organization-resources-images'
  AND auth.uid() IN (
    SELECT user_id FROM user_organizations
    WHERE organization_id = (storage.foldername(name))[1]::uuid
    AND status = 'active'
  )
);

-- Policy: Organization admins can delete images
CREATE POLICY "Organization admins can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'organization-resources-images'
  AND auth.uid() IN (
    SELECT user_id FROM user_organizations
    WHERE organization_id = (storage.foldername(name))[1]::uuid
    AND user_role IN ('organisation', 'staff')
    AND status = 'active'
  )
);

-- =====================================================
-- 3. RLS POLICIES FOR organization-resources-files
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Organization members can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can view files" ON storage.objects;
DROP POLICY IF EXISTS "Organization admins can delete files" ON storage.objects;

-- Policy: Organization members can upload files
CREATE POLICY "Organization members can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-resources-files'
  AND auth.uid() IN (
    SELECT user_id FROM user_organizations
    WHERE organization_id = (storage.foldername(name))[1]::uuid
    AND user_role IN ('organisation', 'staff')
    AND status = 'active'
  )
);

-- Policy: Organization members can view files
CREATE POLICY "Organization members can view files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'organization-resources-files'
  AND auth.uid() IN (
    SELECT user_id FROM user_organizations
    WHERE organization_id = (storage.foldername(name))[1]::uuid
    AND status = 'active'
  )
);

-- Policy: Organization admins can delete files
CREATE POLICY "Organization admins can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'organization-resources-files'
  AND auth.uid() IN (
    SELECT user_id FROM user_organizations
    WHERE organization_id = (storage.foldername(name))[1]::uuid
    AND user_role IN ('organisation', 'staff')
    AND status = 'active'
  )
);

-- =====================================================
-- 4. RLS POLICIES FOR organization-resources-covers
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Organization members can upload cover images" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can view cover images" ON storage.objects;
DROP POLICY IF EXISTS "Organization admins can delete cover images" ON storage.objects;

-- Policy: Organization members can upload cover images
CREATE POLICY "Organization members can upload cover images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-resources-covers'
  AND auth.uid() IN (
    SELECT user_id FROM user_organizations
    WHERE organization_id = (storage.foldername(name))[1]::uuid
    AND user_role IN ('organisation', 'staff')
    AND status = 'active'
  )
);

-- Policy: Organization members can view cover images
CREATE POLICY "Organization members can view cover images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'organization-resources-covers'
  AND auth.uid() IN (
    SELECT user_id FROM user_organizations
    WHERE organization_id = (storage.foldername(name))[1]::uuid
    AND status = 'active'
  )
);

-- Policy: Organization admins can delete cover images
CREATE POLICY "Organization admins can delete cover images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'organization-resources-covers'
  AND auth.uid() IN (
    SELECT user_id FROM user_organizations
    WHERE organization_id = (storage.foldername(name))[1]::uuid
    AND user_role IN ('organisation', 'staff')
    AND status = 'active'
  )
);
