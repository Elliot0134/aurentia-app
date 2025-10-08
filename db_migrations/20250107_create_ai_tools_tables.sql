-- Migration pour les tables AI Tools
-- File: 20250107_create_ai_tools_tables.sql

-- Table des outils IA
CREATE TABLE IF NOT EXISTS ai_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100),
    tags TEXT[],
    image_url TEXT,
    webhook_url TEXT NOT NULL,
    credits_cost INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des favoris utilisateur
CREATE TABLE IF NOT EXISTS ai_tool_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tool_id)
);

-- Table de l'historique d'utilisation
CREATE TABLE IF NOT EXISTS ai_tool_usage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
    project_id UUID,
    input_data JSONB,
    output_data JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    credits_used INTEGER DEFAULT 0,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Table des paramètres utilisateur pour chaque outil
CREATE TABLE IF NOT EXISTS ai_tool_user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
    settings_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tool_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_ai_tool_favorites_user_id ON ai_tool_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tool_usage_history_user_id ON ai_tool_usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tool_usage_history_tool_id ON ai_tool_usage_history(tool_id);
CREATE INDEX IF NOT EXISTS idx_ai_tool_user_settings_user_id ON ai_tool_user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tools_slug ON ai_tools(slug);
CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON ai_tools(category);

-- RLS (Row Level Security) pour la sécurité
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_user_settings ENABLE ROW LEVEL SECURITY;

-- Politique pour ai_tools - lecture publique
CREATE POLICY "Public can read active ai_tools" ON ai_tools
    FOR SELECT USING (is_active = true);

-- Politique pour ai_tool_favorites - utilisateur peut gérer ses propres favoris
CREATE POLICY "Users can manage their own favorites" ON ai_tool_favorites
    FOR ALL USING (auth.uid() = user_id);

-- Politique pour ai_tool_usage_history - utilisateur peut voir son propre historique
CREATE POLICY "Users can read their own usage history" ON ai_tool_usage_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage history" ON ai_tool_usage_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage history" ON ai_tool_usage_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour ai_tool_user_settings - utilisateur peut gérer ses propres paramètres
CREATE POLICY "Users can manage their own tool settings" ON ai_tool_user_settings
    FOR ALL USING (auth.uid() = user_id);

-- Insérer l'outil Blog SEO
INSERT INTO ai_tools (
    id,
    title,
    slug,
    description,
    category,
    tags,
    webhook_url,
    credits_cost,
    is_active
) VALUES (
    '5b1967d7-dd02-4a15-9a01-ea28fb8c5f9e'::uuid,
    'Blog SEO',
    'blog-seo',
    'Générez des articles de blog optimisés pour le SEO avec des liens internes personnalisés',
    'SEO',
    ARRAY['SEO', 'Blog', 'Contenu', 'Marketing'],
    'https://n8n.srv906204.hstgr.cloud/webhook/seo-blog',
    25,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    webhook_url = EXCLUDED.webhook_url,
    credits_cost = EXCLUDED.credits_cost,
    updated_at = NOW();