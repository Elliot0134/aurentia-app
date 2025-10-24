-- Create messaging system
-- This migration creates the complete messaging infrastructure for Aurentia

-- =============================================
-- ENUM TYPES
-- =============================================

DO $$ BEGIN
    CREATE TYPE conversation_type AS ENUM ('personal', 'organization', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sender_type AS ENUM ('user', 'organization', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_type AS ENUM ('text', 'resource_share', 'link');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE participant_role AS ENUM ('member', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE permission_type AS ENUM ('read_only', 'read_write');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- TABLES
-- =============================================

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type conversation_type NOT NULL DEFAULT 'personal',
    is_group BOOLEAN NOT NULL DEFAULT false,
    group_name TEXT,
    group_description TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT,
    auto_delete_days INTEGER,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT group_must_have_name CHECK (
        (is_group = false) OR (is_group = true AND group_name IS NOT NULL)
    ),
    CONSTRAINT org_conversation_has_org CHECK (
        (type != 'organization') OR (type = 'organization' AND organization_id IS NOT NULL)
    )
);

-- Conversation participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role participant_role NOT NULL DEFAULT 'member',
    last_read_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure user can only be in conversation once
    CONSTRAINT unique_conversation_participant UNIQUE (conversation_id, user_id)
);

-- Conversation Messages table (renamed from 'messages' to avoid conflict with chatbot messages table)
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    sender_type sender_type NOT NULL DEFAULT 'user',
    organization_sender_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type message_type NOT NULL DEFAULT 'text',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT user_message_has_sender CHECK (
        (sender_type != 'user') OR (sender_type = 'user' AND sender_id IS NOT NULL)
    ),
    CONSTRAINT org_message_has_org CHECK (
        (sender_type != 'organization') OR (sender_type = 'organization' AND organization_sender_id IS NOT NULL)
    ),
    CONSTRAINT content_not_empty CHECK (LENGTH(TRIM(content)) > 0),
    CONSTRAINT content_max_length CHECK (LENGTH(content) <= 5000)
);

-- Resource shares table
CREATE TABLE IF NOT EXISTS resource_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES conversation_messages(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL,
    shared_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    shared_with_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    permission_type permission_type NOT NULL DEFAULT 'read_only',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Either individual share OR group share, not both
    CONSTRAINT share_target_check CHECK (
        (shared_with_user_id IS NOT NULL AND conversation_id IS NULL) OR
        (shared_with_user_id IS NULL AND conversation_id IS NOT NULL)
    )
);

-- =============================================
-- INDEXES
-- =============================================

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_organization ON conversations(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by_user_id) WHERE created_by_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC NULLS LAST);

-- Conversation participants indexes
CREATE INDEX IF NOT EXISTS idx_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_active ON conversation_participants(user_id, conversation_id) WHERE left_at IS NULL;

-- Conversation Messages indexes
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_created ON conversation_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_sender ON conversation_messages(sender_id) WHERE sender_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversation_messages_deleted ON conversation_messages(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_not_deleted ON conversation_messages(conversation_id, created_at DESC) WHERE deleted_at IS NULL;

-- Resource shares indexes
CREATE INDEX IF NOT EXISTS idx_resource_shares_message ON resource_shares(message_id);
CREATE INDEX IF NOT EXISTS idx_resource_shares_resource ON resource_shares(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_shares_user ON resource_shares(shared_with_user_id) WHERE shared_with_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_resource_shares_conversation ON resource_shares(conversation_id) WHERE conversation_id IS NOT NULL;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update last_message_at on conversations
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get group participant count
CREATE OR REPLACE FUNCTION get_group_participant_count(p_conversation_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM conversation_participants
        WHERE conversation_id = p_conversation_id
        AND left_at IS NULL
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if user is conversation admin
CREATE OR REPLACE FUNCTION is_conversation_admin(p_conversation_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM conversation_participants
        WHERE conversation_id = p_conversation_id
        AND user_id = p_user_id
        AND role = 'admin'
        AND left_at IS NULL
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to cleanup old messages (soft delete)
CREATE OR REPLACE FUNCTION cleanup_old_messages(p_conversation_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_auto_delete_days INTEGER;
    v_deleted_count INTEGER;
BEGIN
    -- Get auto_delete_days setting for conversation
    SELECT auto_delete_days INTO v_auto_delete_days
    FROM conversations
    WHERE id = p_conversation_id;

    -- If no auto-delete set, return 0
    IF v_auto_delete_days IS NULL THEN
        RETURN 0;
    END IF;

    -- Soft delete old messages
    UPDATE conversation_messages
    SET deleted_at = NOW()
    WHERE conversation_id = p_conversation_id
    AND deleted_at IS NULL
    AND created_at < (NOW() - (v_auto_delete_days || ' days')::INTERVAL);

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
DROP TRIGGER IF EXISTS update_conversation_last_message_trigger ON conversation_messages;

-- Update updated_at on conversations
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update last_message_at when new message is created
CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON conversation_messages
    FOR EACH ROW
    WHEN (NEW.deleted_at IS NULL)
    EXECUTE FUNCTION update_conversation_last_message();

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_shares ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CONVERSATIONS POLICIES
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS conversations_select_policy ON conversations;
DROP POLICY IF EXISTS conversations_insert_policy ON conversations;
DROP POLICY IF EXISTS conversations_update_policy ON conversations;
DROP POLICY IF EXISTS conversations_delete_policy ON conversations;

-- Users can view conversations they participate in
CREATE POLICY conversations_select_policy ON conversations
    FOR SELECT
    USING (
        id IN (
            SELECT conversation_id
            FROM conversation_participants
            WHERE user_id = auth.uid()
        )
    );

-- Users can create personal conversations
CREATE POLICY conversations_insert_policy ON conversations
    FOR INSERT
    WITH CHECK (
        (type = 'personal' AND created_by_user_id = auth.uid()) OR
        (type = 'organization' AND EXISTS (
            SELECT 1 FROM user_organizations
            WHERE user_id = auth.uid()
            AND organization_id = conversations.organization_id
            AND user_role IN ('staff', 'organisation')
            AND status = 'active'
        )) OR
        (type = 'system' AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND user_role = 'super_admin'
        ))
    );

-- Users can update conversations they admin or created
CREATE POLICY conversations_update_policy ON conversations
    FOR UPDATE
    USING (
        created_by_user_id = auth.uid() OR
        is_conversation_admin(id, auth.uid())
    );

-- Users can delete conversations they created (group creators)
CREATE POLICY conversations_delete_policy ON conversations
    FOR DELETE
    USING (created_by_user_id = auth.uid());

-- =============================================
-- CONVERSATION PARTICIPANTS POLICIES
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS participants_select_policy ON conversation_participants;
DROP POLICY IF EXISTS participants_insert_policy ON conversation_participants;
DROP POLICY IF EXISTS participants_update_policy ON conversation_participants;
DROP POLICY IF EXISTS participants_delete_policy ON conversation_participants;

-- Users can view their own participations
CREATE POLICY participants_select_policy ON conversation_participants
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can add participants to conversations they admin or create
CREATE POLICY participants_insert_policy ON conversation_participants
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = conversation_id
            AND (c.created_by_user_id = auth.uid() OR is_conversation_admin(c.id, auth.uid()))
        )
    );

-- Users can update their own participation (last_read_at)
CREATE POLICY participants_update_policy ON conversation_participants
    FOR UPDATE
    USING (user_id = auth.uid());

-- Users can delete their own participation (leave) or admins can remove others
CREATE POLICY participants_delete_policy ON conversation_participants
    FOR DELETE
    USING (
        user_id = auth.uid() OR
        is_conversation_admin(conversation_id, auth.uid())
    );

-- =============================================
-- CONVERSATION MESSAGES POLICIES
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS conversation_messages_select_policy ON conversation_messages;
DROP POLICY IF EXISTS conversation_messages_insert_policy ON conversation_messages;
DROP POLICY IF EXISTS conversation_messages_update_policy ON conversation_messages;
DROP POLICY IF EXISTS conversation_messages_delete_policy ON conversation_messages;

-- Users can view messages in conversations they participate in (excluding soft-deleted)
CREATE POLICY conversation_messages_select_policy ON conversation_messages
    FOR SELECT
    USING (
        conversation_id IN (
            SELECT conversation_id
            FROM conversation_participants
            WHERE user_id = auth.uid()
            AND left_at IS NULL
        ) AND deleted_at IS NULL
    );

-- Users can send messages in conversations they participate in
CREATE POLICY conversation_messages_insert_policy ON conversation_messages
    FOR INSERT
    WITH CHECK (
        (sender_type = 'user' AND sender_id = auth.uid() AND
         conversation_id IN (
            SELECT conversation_id
            FROM conversation_participants
            WHERE user_id = auth.uid()
            AND left_at IS NULL
        )) OR
        (sender_type = 'organization' AND EXISTS (
            SELECT 1 FROM user_organizations
            WHERE user_id = auth.uid()
            AND organization_id = organization_sender_id
            AND user_role IN ('staff', 'organisation')
            AND status = 'active'
        )) OR
        (sender_type = 'system' AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND user_role = 'super_admin'
        ))
    );

-- Users can update their own messages (for editing)
CREATE POLICY conversation_messages_update_policy ON conversation_messages
    FOR UPDATE
    USING (
        sender_type = 'user' AND sender_id = auth.uid() AND
        -- Only allow editing within 15 minutes
        (EXTRACT(EPOCH FROM (NOW() - created_at)) < 900 OR edited_at IS NOT NULL)
    );

-- Users can soft-delete their own messages, or org admins can delete org messages
CREATE POLICY conversation_messages_delete_policy ON conversation_messages
    FOR UPDATE
    USING (
        (sender_type = 'user' AND sender_id = auth.uid()) OR
        (sender_type = 'organization' AND EXISTS (
            SELECT 1 FROM user_organizations
            WHERE user_id = auth.uid()
            AND organization_id = organization_sender_id
            AND user_role IN ('staff', 'organisation')
            AND status = 'active'
        ))
    )
    WITH CHECK (deleted_at IS NOT NULL);

-- =============================================
-- RESOURCE SHARES POLICIES
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS resource_shares_select_policy ON resource_shares;
DROP POLICY IF EXISTS resource_shares_insert_policy ON resource_shares;
DROP POLICY IF EXISTS resource_shares_update_policy ON resource_shares;
DROP POLICY IF EXISTS resource_shares_delete_policy ON resource_shares;

-- Users can view shares they created or are recipients of
CREATE POLICY resource_shares_select_policy ON resource_shares
    FOR SELECT
    USING (
        shared_by_user_id = auth.uid() OR
        shared_with_user_id = auth.uid() OR
        (conversation_id IS NOT NULL AND conversation_id IN (
            SELECT conversation_id
            FROM conversation_participants
            WHERE user_id = auth.uid()
            AND left_at IS NULL
        ))
    );

-- Users can create shares for resources they have access to
CREATE POLICY resource_shares_insert_policy ON resource_shares
    FOR INSERT
    WITH CHECK (shared_by_user_id = auth.uid());

-- Users can update shares they created (change permissions)
CREATE POLICY resource_shares_update_policy ON resource_shares
    FOR UPDATE
    USING (shared_by_user_id = auth.uid());

-- Users can delete shares they created (revoke access)
CREATE POLICY resource_shares_delete_policy ON resource_shares
    FOR DELETE
    USING (shared_by_user_id = auth.uid());

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE conversations IS 'Main conversation container supporting personal (1-on-1 and groups), organization, and system message types';
COMMENT ON TABLE conversation_participants IS 'Many-to-many relationship between users and conversations with role-based access';
COMMENT ON TABLE conversation_messages IS 'Individual messages with support for text, resource sharing, and links. Supports soft delete and editing. Renamed from messages to avoid conflict with chatbot messages table';
COMMENT ON TABLE resource_shares IS 'Tracks resource sharing permissions for both individual users and groups';

COMMENT ON COLUMN conversations.is_group IS 'True for group conversations (3+ people), false for 1-on-1';
COMMENT ON COLUMN conversations.auto_delete_days IS 'If set, messages older than this many days are auto-deleted. NULL means no auto-delete';
COMMENT ON COLUMN conversations.last_message_at IS 'Denormalized for efficient sorting. Updated by trigger';
COMMENT ON COLUMN conversation_messages.deleted_at IS 'Soft delete timestamp. Messages with this set are hidden from users';
COMMENT ON COLUMN conversation_messages.edited_at IS 'Timestamp of last edit. Shows (edited) indicator in UI';
COMMENT ON COLUMN resource_shares.conversation_id IS 'For group shares. Mutually exclusive with shared_with_user_id';
