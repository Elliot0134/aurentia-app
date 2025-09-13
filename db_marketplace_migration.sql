-- Créer un schéma séparé pour toute la logique interne/admin
CREATE SCHEMA internal;

-- Accorder les permissions appropriées
GRANT USAGE ON SCHEMA internal TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA internal TO service_role;

-- Table principale des outils IA
CREATE TABLE internal.outils_ia_site (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informations principales
  titre VARCHAR(255) NOT NULL,
  description_courte TEXT NOT NULL,
  description_detaillee TEXT NOT NULL,
  
  -- Médias
  image_url TEXT,
  video_url TEXT,
  
  -- Pricing
  prix_credits INTEGER NOT NULL,
  
  -- Catégorisation
  categorie_principale VARCHAR(100) NOT NULL, -- communication, commercial, marketing, finance, productivite, analyse
  sous_categorie VARCHAR(100) NOT NULL, -- redaction, video, audio, design, social-media, email, prospection, conversion, seo, publicite
  tags TEXT[], -- ["ia", "automatisation", "contenu", "seo"]
  type_output VARCHAR(50) NOT NULL, -- text, html, image, video, audio, pdf, csv, json, zip
  
  -- Workflow & Processing
  webhook_n8n_url TEXT NOT NULL,
  webhook_method VARCHAR(10) DEFAULT 'POST',
  infos_needed JSONB NOT NULL, -- questionnaire utilisateur
  
  -- Metadata
  temps_execution_estime INTEGER, -- en secondes
  popularite INTEGER DEFAULT 0,
  
  -- Status & Visibilité
  statut VARCHAR(20) DEFAULT 'admin', -- admin, publie, maintenance, desactive
  featured BOOLEAN DEFAULT false, -- mis en avant sur le site
  nouveau BOOLEAN DEFAULT true, -- badge "nouveau"
  
  -- Analytics de base
  nb_utilisations INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  
  -- Notes internes (pour phase de test)
  notes_internes TEXT,
  teste_par VARCHAR(255),
  date_test TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour la performance
CREATE INDEX idx_outils_ia_site_statut ON internal.outils_ia_site(statut);
CREATE INDEX idx_outils_ia_site_featured ON internal.outils_ia_site(featured) WHERE featured = true;
CREATE INDEX idx_outils_ia_site_categorie ON internal.outils_ia_site(categorie_principale, sous_categorie);
CREATE INDEX idx_outils_ia_site_tags ON internal.outils_ia_site USING GIN(tags);

-- Table des utilisations
CREATE TABLE public.utilisations_outils (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL, -- Changed from public.users to auth.users
  outil_id UUID REFERENCES internal.outils_ia_site(id) NOT NULL,
  
  -- Données de l'utilisation
  parametres_utilises JSONB NOT NULL, -- données saisies par l'utilisateur
  credits_consommes INTEGER NOT NULL,
  
  -- Status et résultats
  statut VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  resultats JSONB, -- résultats retournés par N8N
  message_erreur TEXT, -- en cas d'erreur
  
  -- Timing
  temps_execution INTEGER, -- temps réel d'exécution en secondes
  webhook_response JSONB, -- réponse complète du webhook N8N
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Index pour les requêtes utilisateur
CREATE INDEX idx_utilisations_user_id ON public.utilisations_outils(user_id);
CREATE INDEX idx_utilisations_outil_id ON public.utilisations_outils(outil_id);
CREATE INDEX idx_utilisations_statut ON public.utilisations_outils(statut);

-- Fonction pour incrémenter le compteur d'utilisation
CREATE OR REPLACE FUNCTION increment_tool_usage(tool_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE internal.outils_ia_site 
    SET 
        nb_utilisations = nb_utilisations + 1,
        last_used_at = NOW()
    WHERE id = tool_id;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security)
-- Activer RLS sur les tables
ALTER TABLE internal.outils_ia_site ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilisations_outils ENABLE ROW LEVEL SECURITY;

-- Policy pour les outils publiés
-- Lecture publique pour les outils publiés, admin voit tout
CREATE POLICY "Read outils published" ON internal.outils_ia_site
  FOR SELECT TO authenticated
  USING (
    statut = 'publie' 
    OR (statut = 'admin' AND auth.jwt() ->> 'email' = 'office.aurentia@gmail.com')
  );

-- Écriture/modification réservée à l'admin
CREATE POLICY "Admin manage outils" ON internal.outils_ia_site
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'office.aurentia@gmail.com');

-- Policies pour les utilisations (utilisateur propriétaire uniquement)
CREATE POLICY "User own utilisations" ON public.utilisations_outils
  FOR ALL TO authenticated
  USING (user_id = auth.uid());
