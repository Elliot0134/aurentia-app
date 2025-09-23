-- Create table for organisation forms
CREATE TABLE IF NOT EXISTS organisation_forms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  blocks JSONB DEFAULT '[]',
  published BOOLEAN DEFAULT FALSE,
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for form responses
CREATE TABLE IF NOT EXISTS organisation_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id TEXT REFERENCES organisation_forms(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '{}',
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_time INTEGER, -- in seconds
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE
);

-- Add indexes
CREATE INDEX idx_organisation_forms_org_id ON organisation_forms(organisation_id);
CREATE INDEX idx_organisation_forms_created_by ON organisation_forms(created_by);
CREATE INDEX idx_organisation_form_responses_form_id ON organisation_form_responses(form_id);
CREATE INDEX idx_organisation_form_responses_submitted_by ON organisation_form_responses(submitted_by);

-- Add RLS policies for organisation_forms
ALTER TABLE organisation_forms ENABLE ROW LEVEL SECURITY;

-- Organisation admins can view all forms in their organisation
CREATE POLICY "Organisation admins can view forms" ON organisation_forms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organisation_members om
      WHERE om.organisation_id = organisation_forms.organisation_id
      AND om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner')
    )
  );

-- Organisation admins can create forms
CREATE POLICY "Organisation admins can create forms" ON organisation_forms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organisation_members om
      WHERE om.organisation_id = organisation_forms.organisation_id
      AND om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner')
    )
  );

-- Organisation admins can update forms
CREATE POLICY "Organisation admins can update forms" ON organisation_forms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organisation_members om
      WHERE om.organisation_id = organisation_forms.organisation_id
      AND om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner')
    )
  );

-- Organisation admins can delete forms
CREATE POLICY "Organisation admins can delete forms" ON organisation_forms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM organisation_members om
      WHERE om.organisation_id = organisation_forms.organisation_id
      AND om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner')
    )
  );

-- Public can view published forms
CREATE POLICY "Public can view published forms" ON organisation_forms
  FOR SELECT USING (published = true);

-- Add RLS policies for organisation_form_responses
ALTER TABLE organisation_form_responses ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a response to a published form
CREATE POLICY "Anyone can submit responses" ON organisation_form_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organisation_forms
      WHERE organisation_forms.id = organisation_form_responses.form_id
      AND organisation_forms.published = true
    )
  );

-- Organisation admins can view responses
CREATE POLICY "Organisation admins can view responses" ON organisation_form_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organisation_members om
      WHERE om.organisation_id = organisation_form_responses.organisation_id
      AND om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner')
    )
  );

-- Users can view their own responses
CREATE POLICY "Users can view own responses" ON organisation_form_responses
  FOR SELECT USING (submitted_by = auth.uid());
