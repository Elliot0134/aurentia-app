-- =====================================================
-- Knowledge Base System Migration
-- =====================================================
-- This migration creates the complete knowledge base system with:
-- 1. Tables for individual and organization knowledge bases
-- 2. Storage usage tracking
-- 3. Storage buckets for file uploads
-- 4. RLS policies for access control
-- 5. Triggers for automatic storage calculation
-- 6. Functions for storage limit enforcement

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Individual/Project Knowledge Base Table
CREATE TABLE IF NOT EXISTS project_knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES project_summary(project_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('document', 'text', 'url')),
  content_data JSONB NOT NULL DEFAULT '{}',
  file_size BIGINT DEFAULT 0,
  file_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Knowledge Base Table
CREATE TABLE IF NOT EXISTS organization_knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('document', 'text', 'url')),
  content_data JSONB NOT NULL DEFAULT '{}',
  file_size BIGINT DEFAULT 0,
  file_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  visibility TEXT DEFAULT 'organization' CHECK (visibility IN ('organization', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage Usage Tracking Table
CREATE TABLE IF NOT EXISTS knowledge_base_storage_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'organization')),
  entity_id UUID NOT NULL,
  total_size_bytes BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_project_kb_project_id ON project_knowledge_base(project_id);
CREATE INDEX IF NOT EXISTS idx_project_kb_user_id ON project_knowledge_base(user_id);
CREATE INDEX IF NOT EXISTS idx_project_kb_content_type ON project_knowledge_base(content_type);
CREATE INDEX IF NOT EXISTS idx_project_kb_created_at ON project_knowledge_base(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_org_kb_organization_id ON organization_knowledge_base(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_kb_created_by ON organization_knowledge_base(created_by);
CREATE INDEX IF NOT EXISTS idx_org_kb_content_type ON organization_knowledge_base(content_type);
CREATE INDEX IF NOT EXISTS idx_org_kb_visibility ON organization_knowledge_base(visibility);
CREATE INDEX IF NOT EXISTS idx_org_kb_created_at ON organization_knowledge_base(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_kb_storage_entity ON knowledge_base_storage_usage(entity_type, entity_id);

-- =====================================================
-- 3. CREATE STORAGE BUCKETS
-- =====================================================

-- Create storage bucket for individual knowledge base files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'knowledge-base-files',
  'knowledge-base-files',
  false,
  52428800, -- 50 MB per file
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for organization knowledge base files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'org-knowledge-base-files',
  'org-knowledge-base-files',
  false,
  104857600, -- 100 MB per file
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/zip',
    'application/x-zip-compressed',
    'video/mp4',
    'video/mpeg',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. CREATE RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE project_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_storage_usage ENABLE ROW LEVEL SECURITY;

-- Project Knowledge Base Policies
CREATE POLICY "Users can view their own project knowledge base"
  ON project_knowledge_base FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own project knowledge base"
  ON project_knowledge_base FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project knowledge base"
  ON project_knowledge_base FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project knowledge base"
  ON project_knowledge_base FOR DELETE
  USING (auth.uid() = user_id);

-- Organization Knowledge Base Policies
CREATE POLICY "Staff can view org knowledge base"
  ON organization_knowledge_base FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
      AND uo.organization_id = organization_knowledge_base.organization_id
      AND uo.user_role IN ('organisation', 'staff')
      AND uo.status = 'active'
    )
  );

CREATE POLICY "Staff can insert org knowledge base"
  ON organization_knowledge_base FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
      AND uo.organization_id = organization_knowledge_base.organization_id
      AND uo.user_role IN ('organisation', 'staff')
      AND uo.status = 'active'
    )
  );

CREATE POLICY "Staff can update org knowledge base"
  ON organization_knowledge_base FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
      AND uo.organization_id = organization_knowledge_base.organization_id
      AND uo.user_role IN ('organisation', 'staff')
      AND uo.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
      AND uo.organization_id = organization_knowledge_base.organization_id
      AND uo.user_role IN ('organisation', 'staff')
      AND uo.status = 'active'
    )
  );

CREATE POLICY "Staff can delete org knowledge base"
  ON organization_knowledge_base FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
      AND uo.organization_id = organization_knowledge_base.organization_id
      AND uo.user_role IN ('organisation', 'staff')
      AND uo.status = 'active'
    )
  );

-- Storage Usage Policies
CREATE POLICY "Users can view their own storage usage"
  ON knowledge_base_storage_usage FOR SELECT
  USING (
    (entity_type = 'project' AND EXISTS (
      SELECT 1 FROM project_summary ps
      WHERE ps.project_id = entity_id
      AND ps.user_id = auth.uid()
    ))
    OR
    (entity_type = 'organization' AND EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.organization_id = entity_id
      AND uo.user_id = auth.uid()
      AND uo.status = 'active'
    ))
  );

-- Storage Bucket Policies for knowledge-base-files
CREATE POLICY "Users can upload to their project knowledge base"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'knowledge-base-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their project knowledge base files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'knowledge-base-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their project knowledge base files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'knowledge-base-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'knowledge-base-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their project knowledge base files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'knowledge-base-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage Bucket Policies for org-knowledge-base-files
CREATE POLICY "Staff can upload to org knowledge base"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'org-knowledge-base-files'
    AND EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
      AND uo.organization_id::text = (storage.foldername(name))[1]
      AND uo.user_role IN ('organisation', 'staff')
      AND uo.status = 'active'
    )
  );

CREATE POLICY "Staff can view org knowledge base files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'org-knowledge-base-files'
    AND EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
      AND uo.organization_id::text = (storage.foldername(name))[1]
      AND uo.status = 'active'
    )
  );

CREATE POLICY "Staff can update org knowledge base files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'org-knowledge-base-files'
    AND EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
      AND uo.organization_id::text = (storage.foldername(name))[1]
      AND uo.user_role IN ('organisation', 'staff')
      AND uo.status = 'active'
    )
  )
  WITH CHECK (
    bucket_id = 'org-knowledge-base-files'
    AND EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
      AND uo.organization_id::text = (storage.foldername(name))[1]
      AND uo.user_role IN ('organisation', 'staff')
      AND uo.status = 'active'
    )
  );

CREATE POLICY "Staff can delete org knowledge base files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'org-knowledge-base-files'
    AND EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
      AND uo.organization_id::text = (storage.foldername(name))[1]
      AND uo.user_role IN ('organisation', 'staff')
      AND uo.status = 'active'
    )
  );

-- =====================================================
-- 5. CREATE FUNCTIONS
-- =====================================================

-- Function to update storage usage for project knowledge base
CREATE OR REPLACE FUNCTION update_project_kb_storage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO knowledge_base_storage_usage (entity_type, entity_id, total_size_bytes)
    VALUES ('project', NEW.project_id, COALESCE(NEW.file_size, 0))
    ON CONFLICT (entity_type, entity_id)
    DO UPDATE SET
      total_size_bytes = knowledge_base_storage_usage.total_size_bytes + COALESCE(NEW.file_size, 0),
      updated_at = NOW();
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE knowledge_base_storage_usage
    SET
      total_size_bytes = total_size_bytes - COALESCE(OLD.file_size, 0) + COALESCE(NEW.file_size, 0),
      updated_at = NOW()
    WHERE entity_type = 'project' AND entity_id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE knowledge_base_storage_usage
    SET
      total_size_bytes = GREATEST(total_size_bytes - COALESCE(OLD.file_size, 0), 0),
      updated_at = NOW()
    WHERE entity_type = 'project' AND entity_id = OLD.project_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update storage usage for organization knowledge base
CREATE OR REPLACE FUNCTION update_org_kb_storage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO knowledge_base_storage_usage (entity_type, entity_id, total_size_bytes)
    VALUES ('organization', NEW.organization_id, COALESCE(NEW.file_size, 0))
    ON CONFLICT (entity_type, entity_id)
    DO UPDATE SET
      total_size_bytes = knowledge_base_storage_usage.total_size_bytes + COALESCE(NEW.file_size, 0),
      updated_at = NOW();
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE knowledge_base_storage_usage
    SET
      total_size_bytes = total_size_bytes - COALESCE(OLD.file_size, 0) + COALESCE(NEW.file_size, 0),
      updated_at = NOW()
    WHERE entity_type = 'organization' AND entity_id = NEW.organization_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE knowledge_base_storage_usage
    SET
      total_size_bytes = GREATEST(total_size_bytes - COALESCE(OLD.file_size, 0), 0),
      updated_at = NOW()
    WHERE entity_type = 'organization' AND entity_id = OLD.organization_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. CREATE TRIGGERS
-- =====================================================

-- Triggers for project knowledge base
CREATE TRIGGER update_project_kb_storage_trigger
  AFTER INSERT OR UPDATE OR DELETE ON project_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_project_kb_storage();

CREATE TRIGGER update_project_kb_timestamp
  BEFORE UPDATE ON project_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers for organization knowledge base
CREATE TRIGGER update_org_kb_storage_trigger
  AFTER INSERT OR UPDATE OR DELETE ON organization_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_org_kb_storage();

CREATE TRIGGER update_org_kb_timestamp
  BEFORE UPDATE ON organization_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for storage usage
CREATE TRIGGER update_storage_usage_timestamp
  BEFORE UPDATE ON knowledge_base_storage_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON project_knowledge_base TO authenticated;
GRANT ALL ON organization_knowledge_base TO authenticated;
GRANT ALL ON knowledge_base_storage_usage TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================
