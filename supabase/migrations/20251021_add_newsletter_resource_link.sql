-- Migration: Add resource linking to newsletters
-- Description: Adds ability to link newsletters to source resources with sync capabilities

-- =============================================
-- 1. Add columns to org_newsletters table
-- =============================================

ALTER TABLE org_newsletters
ADD COLUMN IF NOT EXISTS source_resource_id uuid REFERENCES organization_resources(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS resource_version integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS sync_enabled boolean DEFAULT true;

-- =============================================
-- 2. Add index for performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_org_newsletters_source_resource_id
ON org_newsletters(source_resource_id);

-- =============================================
-- 3. Add comments for documentation
-- =============================================

COMMENT ON COLUMN org_newsletters.source_resource_id IS 'Links newsletter to the source resource it was created from';
COMMENT ON COLUMN org_newsletters.resource_version IS 'Tracks which version of the resource was used to create/update the newsletter';
COMMENT ON COLUMN org_newsletters.sync_enabled IS 'Controls whether the newsletter should auto-sync when source resource changes';

-- =============================================
-- 4. Create storage bucket for org resources if it doesn't exist
-- =============================================

-- Insert bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('org-resources', 'org-resources', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 5. Set up RLS policies for org-resources bucket
-- =============================================

-- Allow authenticated users to read files
CREATE POLICY IF NOT EXISTS "Authenticated users can view org resource files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'org-resources');

-- Allow organization members to upload files to their organization folder
CREATE POLICY IF NOT EXISTS "Organization members can upload resource files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'org-resources' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM user_organizations
    WHERE user_id = auth.uid()
    AND status = 'active'
  )
);

-- Allow organization members to update files in their organization folder
CREATE POLICY IF NOT EXISTS "Organization members can update resource files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'org-resources' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM user_organizations
    WHERE user_id = auth.uid()
    AND status = 'active'
  )
);

-- Allow organization members to delete files in their organization folder
CREATE POLICY IF NOT EXISTS "Organization members can delete resource files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'org-resources' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM user_organizations
    WHERE user_id = auth.uid()
    AND status = 'active'
  )
);

-- =============================================
-- 6. Add function to get linked newsletters for a resource
-- =============================================

CREATE OR REPLACE FUNCTION get_resource_linked_newsletters(resource_id_param uuid)
RETURNS TABLE (
  id uuid,
  subject text,
  status text,
  sync_enabled boolean,
  resource_version integer,
  sent_at timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.subject,
    n.status::text,
    n.sync_enabled,
    n.resource_version,
    n.sent_at,
    n.created_at
  FROM org_newsletters n
  WHERE n.source_resource_id = resource_id_param
  ORDER BY n.created_at DESC;
END;
$$;

COMMENT ON FUNCTION get_resource_linked_newsletters IS 'Returns all newsletters linked to a specific resource';
