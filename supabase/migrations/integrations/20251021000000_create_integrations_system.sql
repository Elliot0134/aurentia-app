-- =====================================================
-- Integration System Migration
-- Created: 2025-10-21
-- Description: Complete integration system for Slack, Discord, Teams, Google Calendar, Trello, and Notion
-- Phase: 1 (Slack + Discord webhooks)
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: integrations
-- Purpose: Store connected integrations (Slack, Discord, Teams, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Ownership (either user or organization, not both)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Integration details
  integration_type TEXT NOT NULL,
  status TEXT DEFAULT 'disconnected' NOT NULL,

  -- Encrypted credentials (webhook URLs, OAuth tokens, etc.)
  -- NOTE: Encrypted in application layer using AES-256
  credentials TEXT NOT NULL,

  -- User-defined settings (events to notify, channel preferences, etc.)
  settings JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  connected_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,

  -- Constraints
  CONSTRAINT user_or_org_integration CHECK (
    (user_id IS NOT NULL AND organisation_id IS NULL) OR
    (user_id IS NULL AND organisation_id IS NOT NULL)
  ),
  CONSTRAINT valid_integration_type CHECK (
    integration_type IN ('slack', 'discord', 'teams', 'google_calendar', 'trello', 'notion')
  ),
  CONSTRAINT valid_status CHECK (
    status IN ('connected', 'disconnected', 'error', 'pending')
  )
);

-- Indexes for performance
CREATE INDEX idx_integrations_user_id ON integrations(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_integrations_org_id ON integrations(organisation_id) WHERE organisation_id IS NOT NULL;
CREATE INDEX idx_integrations_type ON integrations(integration_type);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_integrations_active ON integrations(status) WHERE status = 'connected';

-- Unique constraint: one integration type per user/org
CREATE UNIQUE INDEX idx_integrations_unique_user_type
  ON integrations(user_id, integration_type)
  WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_integrations_unique_org_type
  ON integrations(organisation_id, integration_type)
  WHERE organisation_id IS NOT NULL;

-- Comments
COMMENT ON TABLE integrations IS 'Stores connected third-party integrations for users and organizations';
COMMENT ON COLUMN integrations.credentials IS 'Encrypted credentials (webhook URLs or OAuth tokens)';
COMMENT ON COLUMN integrations.settings IS 'User configuration: events to notify, sync preferences, etc.';

-- =====================================================
-- TABLE: integration_webhooks
-- Purpose: User-defined outgoing webhooks
-- =====================================================
CREATE TABLE IF NOT EXISTS integration_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Ownership
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Webhook details
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT ARRAY[]::TEXT[],
  secret TEXT, -- HMAC secret for signature verification (optional)

  -- Settings
  active BOOLEAN DEFAULT true NOT NULL,
  retry_on_failure BOOLEAN DEFAULT true NOT NULL,
  max_retries INTEGER DEFAULT 3 NOT NULL,
  timeout_seconds INTEGER DEFAULT 5 NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_triggered_at TIMESTAMPTZ,
  total_calls INTEGER DEFAULT 0 NOT NULL,
  failed_calls INTEGER DEFAULT 0 NOT NULL,

  -- Constraints
  CONSTRAINT user_or_org_webhook CHECK (
    (user_id IS NOT NULL AND organisation_id IS NULL) OR
    (user_id IS NULL AND organisation_id IS NOT NULL)
  ),
  CONSTRAINT valid_timeout CHECK (timeout_seconds > 0 AND timeout_seconds <= 30),
  CONSTRAINT valid_retries CHECK (max_retries >= 0 AND max_retries <= 5)
);

-- Indexes
CREATE INDEX idx_webhooks_user_id ON integration_webhooks(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_webhooks_org_id ON integration_webhooks(organisation_id) WHERE organisation_id IS NOT NULL;
CREATE INDEX idx_webhooks_active ON integration_webhooks(active) WHERE active = true;

-- Comments
COMMENT ON TABLE integration_webhooks IS 'User-defined webhooks for receiving Aurentia events';
COMMENT ON COLUMN integration_webhooks.secret IS 'HMAC secret for webhook signature verification';

-- =====================================================
-- TABLE: integration_api_keys
-- Purpose: API keys for accessing Aurentia API
-- =====================================================
CREATE TABLE IF NOT EXISTS integration_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Ownership
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Key details
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- SHA-256 hash of the key
  key_prefix TEXT NOT NULL, -- First 8 characters for display
  scope TEXT DEFAULT 'personal' NOT NULL,

  -- Permissions
  permissions JSONB DEFAULT '{"read": true, "write": false}'::jsonb,
  rate_limit INTEGER DEFAULT 1000 NOT NULL, -- Requests per hour

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- NULL = no expiration
  revoked BOOLEAN DEFAULT false NOT NULL,

  -- Constraints
  CONSTRAINT user_or_org_api_key CHECK (
    (user_id IS NOT NULL AND organisation_id IS NULL) OR
    (user_id IS NULL AND organisation_id IS NOT NULL)
  ),
  CONSTRAINT valid_scope CHECK (scope IN ('personal', 'organization')),
  CONSTRAINT valid_rate_limit CHECK (rate_limit > 0 AND rate_limit <= 10000)
);

-- Indexes
CREATE INDEX idx_api_keys_user_id ON integration_api_keys(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_api_keys_org_id ON integration_api_keys(organisation_id) WHERE organisation_id IS NOT NULL;
CREATE INDEX idx_api_keys_hash ON integration_api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON integration_api_keys(revoked, expires_at)
  WHERE revoked = false AND (expires_at IS NULL OR expires_at > NOW());

-- Comments
COMMENT ON TABLE integration_api_keys IS 'API keys for programmatic access to Aurentia';
COMMENT ON COLUMN integration_api_keys.key_hash IS 'SHA-256 hash for secure key verification';

-- =====================================================
-- TABLE: integration_logs
-- Purpose: Audit log for integration activity (debugging)
-- =====================================================
CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,

  -- Log details
  event_type TEXT NOT NULL,
  payload JSONB,
  response JSONB,
  status_code INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  duration_ms INTEGER
);

-- Indexes
CREATE INDEX idx_logs_integration_id ON integration_logs(integration_id);
CREATE INDEX idx_logs_created_at ON integration_logs(created_at DESC);
CREATE INDEX idx_logs_success ON integration_logs(success);
CREATE INDEX idx_logs_event_type ON integration_logs(event_type);

-- Composite index for common queries
CREATE INDEX idx_logs_integration_recent ON integration_logs(integration_id, created_at DESC);

-- Comments
COMMENT ON TABLE integration_logs IS 'Audit log for integration webhook calls and API activity';
COMMENT ON COLUMN integration_logs.duration_ms IS 'Time taken for webhook/API call in milliseconds';

-- =====================================================
-- FUNCTION: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to integrations table
DROP TRIGGER IF EXISTS update_integrations_updated_at ON integrations;
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to webhooks table
DROP TRIGGER IF EXISTS update_webhooks_updated_at ON integration_webhooks;
CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON integration_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION: Auto-cleanup old logs (30 days retention)
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_old_integration_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM integration_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON FUNCTION cleanup_old_integration_logs() IS 'Delete integration logs older than 30 days. Run periodically via cron.';

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: integrations
-- =====================================================

-- Users can view their own integrations
CREATE POLICY "Users can view own integrations"
  ON integrations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can manage their own integrations
CREATE POLICY "Users can insert own integrations"
  ON integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations"
  ON integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations"
  ON integrations FOR DELETE
  USING (auth.uid() = user_id);

-- Organization members can view org integrations
CREATE POLICY "Org members can view org integrations"
  ON integrations FOR SELECT
  USING (
    organisation_id IN (
      SELECT organisation_id FROM organisation_members
      WHERE user_id = auth.uid()
    )
  );

-- Organization admins (organisation or staff role) can manage org integrations
CREATE POLICY "Org admins can insert org integrations"
  ON integrations FOR INSERT
  WITH CHECK (
    organisation_id IN (
      SELECT organisation_id FROM organisation_members
      WHERE user_id = auth.uid()
      AND role IN ('organisation', 'staff')
    )
  );

CREATE POLICY "Org admins can update org integrations"
  ON integrations FOR UPDATE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM organisation_members
      WHERE user_id = auth.uid()
      AND role IN ('organisation', 'staff')
    )
  );

CREATE POLICY "Org admins can delete org integrations"
  ON integrations FOR DELETE
  USING (
    organisation_id IN (
      SELECT organisation_id FROM organisation_members
      WHERE user_id = auth.uid()
      AND role IN ('organisation', 'staff')
    )
  );

-- =====================================================
-- RLS POLICIES: integration_webhooks
-- =====================================================

-- Users can manage their own webhooks
CREATE POLICY "Users can manage own webhooks"
  ON integration_webhooks FOR ALL
  USING (auth.uid() = user_id);

-- Org admins can manage org webhooks
CREATE POLICY "Org admins can manage org webhooks"
  ON integration_webhooks FOR ALL
  USING (
    organisation_id IN (
      SELECT organisation_id FROM organisation_members
      WHERE user_id = auth.uid()
      AND role IN ('organisation', 'staff')
    )
  );

-- =====================================================
-- RLS POLICIES: integration_api_keys
-- =====================================================

-- Users can manage their own API keys
CREATE POLICY "Users can manage own API keys"
  ON integration_api_keys FOR ALL
  USING (auth.uid() = user_id);

-- Org admins can manage org API keys
CREATE POLICY "Org admins can manage org API keys"
  ON integration_api_keys FOR ALL
  USING (
    organisation_id IN (
      SELECT organisation_id FROM organisation_members
      WHERE user_id = auth.uid()
      AND role IN ('organisation', 'staff')
    )
  );

-- =====================================================
-- RLS POLICIES: integration_logs
-- =====================================================

-- Users can view logs for their integrations
CREATE POLICY "Users can view own integration logs"
  ON integration_logs FOR SELECT
  USING (
    integration_id IN (
      SELECT id FROM integrations WHERE user_id = auth.uid()
    )
  );

-- Org members can view org integration logs
CREATE POLICY "Org members can view org integration logs"
  ON integration_logs FOR SELECT
  USING (
    integration_id IN (
      SELECT i.id FROM integrations i
      INNER JOIN organisation_members om ON i.organisation_id = om.organisation_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Only system can insert/update/delete logs (not users)
-- Note: This means logs are inserted via service role or edge functions

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON integrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_webhooks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_api_keys TO authenticated;
GRANT SELECT ON integration_logs TO authenticated;

-- =====================================================
-- INITIAL DATA / SEED (optional)
-- =====================================================

-- No seed data for Phase 1
-- Users will create integrations via UI

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add migration tracking comment
COMMENT ON TABLE integrations IS 'Integration system - Phase 1: Slack & Discord webhooks';
