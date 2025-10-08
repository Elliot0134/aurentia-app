-- Migration pour créer les tables AI Tools et insérer l'outil Blog SEO
-- Date: 2025-01-07

-- Table des outils IA
CREATE TABLE IF NOT EXISTS public.ai_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  short_description text,
  category text NOT NULL DEFAULT 'text',
  tags text[] DEFAULT '{}',
  credits_cost integer NOT NULL DEFAULT 25,
  icon_url text,
  image_url text,
  video_url text,
  difficulty text CHECK (difficulty IN ('Facile', 'Moyenne', 'Difficile')),
  estimated_time text,
  webhook_url text NOT NULL,
  features text[] DEFAULT '{}',
  what_you_get text[] DEFAULT '{}',
  how_to_use_steps jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table des favoris d'outils IA
CREATE TABLE IF NOT EXISTS public.ai_tool_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES public.ai_tools(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- Table de l'historique d'utilisation des outils IA
CREATE TABLE IF NOT EXISTS public.ai_tool_usage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES public.ai_tools(id) ON DELETE CASCADE,
  project_id uuid, -- Peut être NULL si pas lié à un projet
  input_data jsonb NOT NULL DEFAULT '{}',
  output_data jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  credits_used integer,
  execution_time_ms integer,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Table des paramètres utilisateur pour les outils IA
CREATE TABLE IF NOT EXISTS public.ai_tool_user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES public.ai_tools(id) ON DELETE CASCADE,
  settings_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_ai_tools_updated_at 
  BEFORE UPDATE ON public.ai_tools 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_tool_user_settings_updated_at 
  BEFORE UPDATE ON public.ai_tool_user_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer l'outil Blog SEO
INSERT INTO public.ai_tools (
  id,
  slug,
  title,
  description,
  short_description,
  category,
  tags,
  credits_cost,
  webhook_url,
  features,
  what_you_get,
  how_to_use_steps,
  difficulty,
  estimated_time
) VALUES (
  '5b1967d7-dd02-4a15-9a01-ea28fb8c5f9e',
  'seo-blog',
  'Générateur d\'Articles de Blog SEO',
  'Créez des articles de blog optimisés pour le SEO qui captent l''attention de votre audience cible et améliorent votre classement dans les moteurs de recherche. Cet outil utilise l''IA pour générer du contenu de qualité, structuré et optimisé.',
  'Génère des articles de blog optimisés SEO avec IA',
  'text',
  ARRAY['SEO', 'Blog', 'Contenu', 'Marketing', 'Rédaction'],
  25,
  'https://n8n.srv906204.hstgr.cloud/webhook/seo-blog',
  ARRAY[
    'Génération d''articles optimisés SEO',
    'Adaptation au public cible',
    'Structure claire et engageante',
    'Méta-description incluse',
    'Mots-clés intégrés naturellement'
  ],
  ARRAY[
    'Article de blog complet (1000-1500 mots)',
    'Méta-description optimisée',
    'Structure avec titres et sous-titres',
    'Contenu adapté à votre audience',
    'Suggestions de mots-clés'
  ],
  '[
    {
      "step": 1,
      "title": "Définir votre public cible",
      "description": "Dans l''onglet Paramètres, précisez votre audience (entrepreneurs, étudiants, etc.) pour adapter le ton et le style."
    },
    {
      "step": 2,
      "title": "Saisir le thème",
      "description": "Dans l''onglet Utilisation, décrivez le sujet principal de votre article de blog."
    },
    {
      "step": 3,
      "title": "Générer l''article",
      "description": "Cliquez sur \"Générer l''article\" et attendez que l''IA crée votre contenu optimisé."
    },
    {
      "step": 4,
      "title": "Copier et utiliser",
      "description": "Copiez le résultat ou téléchargez-le pour l''utiliser sur votre site web ou blog."
    }
  ]'::jsonb,
  'Facile',
  '2-3 minutes'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  credits_cost = EXCLUDED.credits_cost,
  webhook_url = EXCLUDED.webhook_url,
  features = EXCLUDED.features,
  what_you_get = EXCLUDED.what_you_get,
  how_to_use_steps = EXCLUDED.how_to_use_steps,
  difficulty = EXCLUDED.difficulty,
  estimated_time = EXCLUDED.estimated_time,
  updated_at = now();

-- Politique de sécurité RLS (Row Level Security)
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tool_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tool_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tool_user_settings ENABLE ROW LEVEL SECURITY;

-- Politiques pour ai_tools (lecture publique, écriture admin)
CREATE POLICY "Outils IA visibles par tous" ON public.ai_tools
  FOR SELECT USING (is_active = true);

-- Politiques pour ai_tool_favorites (utilisateur peut gérer ses favoris)
CREATE POLICY "Utilisateur peut voir ses favoris" ON public.ai_tool_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Utilisateur peut ajouter aux favoris" ON public.ai_tool_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateur peut supprimer ses favoris" ON public.ai_tool_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour ai_tool_usage_history (utilisateur peut voir son historique)
CREATE POLICY "Utilisateur peut voir son historique" ON public.ai_tool_usage_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Utilisateur peut créer des entrées d'historique" ON public.ai_tool_usage_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateur peut mettre à jour son historique" ON public.ai_tool_usage_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour ai_tool_user_settings (utilisateur peut gérer ses paramètres)
CREATE POLICY "Utilisateur peut voir ses paramètres" ON public.ai_tool_user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Utilisateur peut créer ses paramètres" ON public.ai_tool_user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateur peut mettre à jour ses paramètres" ON public.ai_tool_user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Utilisateur peut supprimer ses paramètres" ON public.ai_tool_user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_ai_tools_slug ON public.ai_tools(slug);
CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON public.ai_tools(category);
CREATE INDEX IF NOT EXISTS idx_ai_tools_active ON public.ai_tools(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_tool_favorites_user_id ON public.ai_tool_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tool_usage_history_user_id ON public.ai_tool_usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tool_usage_history_tool_id ON public.ai_tool_usage_history(tool_id);
CREATE INDEX IF NOT EXISTS idx_ai_tool_usage_history_created_at ON public.ai_tool_usage_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_tool_user_settings_user_tool ON public.ai_tool_user_settings(user_id, tool_id);