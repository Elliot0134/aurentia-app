-- Migration pour créer la table des outils IA
-- À exécuter dans Supabase SQL Editor

-- Table principale des outils IA
CREATE TABLE public.ai_tools (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  long_description text,
  category text NOT NULL,
  subcategory text,
  icon text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  complexity text NOT NULL CHECK (complexity IN ('Simple', 'Moyenne', 'Avancée')),
  estimated_time text NOT NULL,
  output_type text NOT NULL,
  tags text[] DEFAULT '{}',
  features text[] DEFAULT '{}',
  popular boolean DEFAULT false,
  active boolean DEFAULT true,
  rating numeric(2,1) DEFAULT 4.5,
  reviews_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT ai_tools_pkey PRIMARY KEY (id)
);

-- Table des catégories d'outils
CREATE TABLE public.tool_categories (
  id text NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  color text,
  order_index integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT tool_categories_pkey PRIMARY KEY (id)
);

-- Table des favoris utilisateur
CREATE TABLE public.user_tool_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tool_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT user_tool_favorites_pkey PRIMARY KEY (id),
  CONSTRAINT user_tool_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_tool_favorites_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.ai_tools(id) ON DELETE CASCADE,
  CONSTRAINT user_tool_favorites_unique UNIQUE (user_id, tool_id)
);

-- Table de l'historique d'utilisation des outils
CREATE TABLE public.tool_usage_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tool_id uuid NOT NULL,
  project_id uuid,
  input_data jsonb,
  output_data jsonb,
  credits_used integer DEFAULT 0,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  
  CONSTRAINT tool_usage_history_pkey PRIMARY KEY (id),
  CONSTRAINT tool_usage_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT tool_usage_history_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.ai_tools(id) ON DELETE CASCADE,
  CONSTRAINT tool_usage_history_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project_summary(project_id) ON DELETE SET NULL
);

-- Insertion des catégories
INSERT INTO public.tool_categories (id, name, description, icon, color, order_index) VALUES
('juridique', 'Juridique & Conformité', 'Outils pour la création de documents juridiques et la conformité', 'Scale', 'purple', 1),
('finance', 'Finance & Business Plan', 'Outils financiers et de planification business', 'DollarSign', 'green', 2),
('marketing', 'Marketing & Communication', 'Outils de marketing et communication', 'Megaphone', 'blue', 3),
('seo', 'SEO & Référencement', 'Outils d\'optimisation pour les moteurs de recherche', 'Search', 'orange', 4),
('presentation', 'Présentations & Slides', 'Générateurs de présentations professionnelles', 'Presentation', 'red', 5),
('redaction', 'Rédaction & Contenu', 'Outils de création de contenu et rédaction', 'PenTool', 'indigo', 6),
('analyse', 'Analyse & Reporting', 'Outils d\'analyse et de génération de rapports', 'BarChart3', 'teal', 7),
('design', 'Design & Identité', 'Outils de création graphique et d\'identité visuelle', 'Palette', 'pink', 8),
('digital', 'Digital & Automatisation', 'Outils numériques et d\'automatisation', 'Zap', 'cyan', 9);

-- Insertion des outils (échantillon complet)
INSERT INTO public.ai_tools (name, description, long_description, category, icon, price, complexity, estimated_time, output_type, tags, features, popular, rating, reviews_count) VALUES

-- JURIDIQUE & CONFORMITÉ
('Générateur de contrats commerciaux', 'Génère des contrats personnalisés selon vos besoins', 'Cette automatisation utilise l''IA pour créer des contrats juridiques personnalisés en fonction de votre secteur d''activité. Elle inclut des clauses standards, des conditions spécifiques et s''adapte aux réglementations en vigueur.', 'juridique', 'FileText', 12, 'Moyenne', '10-15 min', 'PDF', ARRAY['contrat', 'juridique', 'commercial'], ARRAY['Templates multiples selon le secteur', 'Personnalisation automatique', 'Export PDF professionnel', 'Clauses juridiques à jour', 'Validation automatique'], true, 4.8, 156),

('Créateur de CGV/CGU', 'Conditions générales personnalisées pour votre activité', 'Génère automatiquement des conditions générales de vente et d''utilisation conformes à la réglementation française et européenne, adaptées à votre secteur d''activité.', 'juridique', 'Shield', 8, 'Simple', '5-10 min', 'PDF', ARRAY['cgv', 'cgu', 'juridique', 'conformité'], ARRAY['Conformité RGPD', 'Adaptation sectorielle', 'Mise à jour automatique', 'Export multi-format'], false, 4.6, 89),

('Générateur de mentions légales', 'Mentions légales conformes RGPD', 'Crée des mentions légales complètes et conformes à la réglementation RGPD, adaptées à votre type d''activité et votre présence en ligne.', 'juridique', 'Info', 6, 'Simple', '3-5 min', 'HTML', ARRAY['mentions légales', 'rgpd', 'conformité'], ARRAY['Conformité RGPD garantie', 'Adaptation automatique', 'Code HTML prêt', 'Mise à jour réglementaire'], false, 4.7, 134),

('Rédacteur de politiques de confidentialité', 'Protection des données personnelles', 'Génère une politique de confidentialité complète et conforme au RGPD, adaptée à vos pratiques de collecte et traitement des données.', 'juridique', 'Lock', 10, 'Moyenne', '8-12 min', 'PDF', ARRAY['confidentialité', 'rgpd', 'données'], ARRAY['Conformité RGPD', 'Analyse des traitements', 'Clauses personnalisées', 'Export professionnel'], true, 4.9, 203),

-- FINANCE & BUSINESS PLAN
('Générateur de business plan complet', 'Business plan professionnel structuré', 'Crée un business plan complet avec analyse financière, étude de marché, stratégie commerciale et projections sur 3-5 ans.', 'finance', 'TrendingUp', 15, 'Avancée', '30-45 min', 'PDF', ARRAY['business plan', 'finance', 'stratégie'], ARRAY['Structure professionnelle', 'Projections financières', 'Analyse de marché', 'Graphiques intégrés', 'Export investisseurs'], true, 4.8, 178),

('Créateur de plan de financement', 'Besoins et ressources financières', 'Élabore un plan de financement détaillé avec analyse des besoins, sources de financement et échéancier de remboursement.', 'finance', 'Calculator', 12, 'Moyenne', '15-25 min', 'Excel', ARRAY['financement', 'budget', 'prévisionnel'], ARRAY['Calculs automatiques', 'Scénarios multiples', 'Graphiques dynamiques', 'Export Excel'], false, 4.5, 92),

('Générateur de pitch deck', 'Présentations investisseurs optimisées', 'Crée des présentations professionnelles pour lever des fonds, avec structure optimisée et design attractif.', 'finance', 'Presentation', 18, 'Avancée', '25-35 min', 'PowerPoint', ARRAY['pitch', 'investisseurs', 'levée de fonds'], ARRAY['Templates professionnels', 'Structure optimisée', 'Design moderne', 'Conseils intégrés'], true, 4.7, 145),

-- SEO & RÉFÉRENCEMENT
('Analyseur de mots-clés', 'Recherche et analyse de la concurrence', 'Analyse approfondie des mots-clés de votre secteur avec volume de recherche, difficulté et opportunités.', 'seo', 'Search', 8, 'Simple', '5-10 min', 'Excel', ARRAY['seo', 'mots-clés', 'recherche'], ARRAY['Volume de recherche', 'Analyse concurrence', 'Opportunités identifiées', 'Export détaillé'], false, 4.4, 67),

('Générateur de contenu SEO', 'Articles optimisés pour le référencement', 'Crée du contenu optimisé SEO avec structure H1-H6, mots-clés intégrés et méta-descriptions.', 'seo', 'FileText', 10, 'Moyenne', '15-20 min', 'HTML', ARRAY['seo', 'contenu', 'rédaction'], ARRAY['Optimisation automatique', 'Structure SEO', 'Méta-données', 'Analyse lisibilité'], true, 4.6, 123),

-- PRÉSENTATIONS & SLIDES
('Générateur de PowerPoint professionnel', 'Présentations avec templates et contenu', 'Crée des présentations PowerPoint professionnelles avec templates modernes et contenu adapté à votre secteur.', 'presentation', 'Monitor', 14, 'Moyenne', '20-30 min', 'PowerPoint', ARRAY['powerpoint', 'présentation', 'business'], ARRAY['Templates modernes', 'Contenu personnalisé', 'Animations intégrées', 'Export haute qualité'], true, 4.8, 189),

-- RÉDACTION & CONTENU
('Générateur d''articles de blog', 'Contenu thématique optimisé', 'Rédige des articles de blog complets et engageants sur vos thématiques métier avec optimisation SEO.', 'redaction', 'PenTool', 9, 'Simple', '10-15 min', 'HTML', ARRAY['blog', 'rédaction', 'contenu'], ARRAY['Rédaction automatique', 'Optimisation SEO', 'Structure professionnelle', 'Ton personnalisable'], false, 4.5, 98),

-- ANALYSE & REPORTING
('Générateur de rapports d''activité', 'Synthèses périodiques professionnelles', 'Crée des rapports d''activité complets avec KPIs, graphiques et analyses de performance.', 'analyse', 'BarChart3', 11, 'Moyenne', '15-25 min', 'PDF', ARRAY['rapport', 'analyse', 'kpi'], ARRAY['KPIs automatiques', 'Graphiques intégrés', 'Analyse comparative', 'Export professionnel'], false, 4.3, 78),

-- DESIGN & IDENTITÉ
('Générateur de charte graphique', 'Identité visuelle complète', 'Crée une charte graphique professionnelle avec logo, couleurs, typographies et déclinaisons.', 'design', 'Palette', 16, 'Avancée', '35-50 min', 'PDF', ARRAY['design', 'identité', 'charte'], ARRAY['Logo personnalisé', 'Palette couleurs', 'Guide d''utilisation', 'Déclinaisons multiples'], true, 4.7, 167),

-- DIGITAL & AUTOMATISATION
('Générateur de cahier des charges', 'Spécifications techniques détaillées', 'Élabore un cahier des charges complet pour vos projets digitaux avec spécifications techniques et fonctionnelles.', 'digital', 'Settings', 13, 'Moyenne', '20-30 min', 'PDF', ARRAY['cahier des charges', 'technique', 'digital'], ARRAY['Spécifications détaillées', 'Architecture technique', 'Planning projet', 'Budget estimatif'], false, 4.4, 85);

-- Index pour optimiser les performances
CREATE INDEX idx_ai_tools_category ON public.ai_tools(category);
CREATE INDEX idx_ai_tools_popular ON public.ai_tools(popular);
CREATE INDEX idx_ai_tools_active ON public.ai_tools(active);
CREATE INDEX idx_user_tool_favorites_user_id ON public.user_tool_favorites(user_id);
CREATE INDEX idx_tool_usage_history_user_id ON public.tool_usage_history(user_id);
CREATE INDEX idx_tool_usage_history_created_at ON public.tool_usage_history(created_at);

-- RLS (Row Level Security) policies
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tool_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_usage_history ENABLE ROW LEVEL SECURITY;

-- Policies pour ai_tools (lecture publique)
CREATE POLICY "ai_tools_select_policy" ON public.ai_tools FOR SELECT USING (active = true);

-- Policies pour tool_categories (lecture publique)
CREATE POLICY "tool_categories_select_policy" ON public.tool_categories FOR SELECT USING (active = true);

-- Policies pour user_tool_favorites (utilisateur propriétaire)
CREATE POLICY "user_tool_favorites_select_policy" ON public.user_tool_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_tool_favorites_insert_policy" ON public.user_tool_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_tool_favorites_delete_policy" ON public.user_tool_favorites FOR DELETE USING (auth.uid() = user_id);

-- Policies pour tool_usage_history (utilisateur propriétaire)
CREATE POLICY "tool_usage_history_select_policy" ON public.tool_usage_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tool_usage_history_insert_policy" ON public.tool_usage_history FOR INSERT WITH CHECK (auth.uid() = user_id);