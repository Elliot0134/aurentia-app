-- Migration pour la refonte des ressources avec contenu détaillé
-- Date: 2025-01-01
-- Description: Ajoute les nouvelles colonnes pour la page ressources détaillée

-- Ajouter les nouvelles colonnes pour les images
ALTER TABLE resources ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS image_2_url TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS image_3_url TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS image_4_url TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS detailed_description TEXT;

-- FAQ (3 questions/réponses max)
ALTER TABLE resources ADD COLUMN IF NOT EXISTS faq_question_1 TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS faq_answer_1 TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS faq_question_2 TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS faq_answer_2 TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS faq_question_3 TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS faq_answer_3 TEXT;

-- "Pourquoi choisir cette template ?" (3 containers)
ALTER TABLE resources ADD COLUMN IF NOT EXISTS reason_1_title TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS reason_1_text TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS reason_2_title TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS reason_2_text TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS reason_3_title TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS reason_3_text TEXT;

-- "Inclus dans la template" (liste avec emojis)
ALTER TABLE resources ADD COLUMN IF NOT EXISTS included_items JSONB DEFAULT '[]';

-- Ajouter des index pour les performances
CREATE INDEX IF NOT EXISTS idx_resources_video_url ON resources(video_url) WHERE video_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_resources_detailed_desc ON resources USING gin(to_tsvector('french', detailed_description)) WHERE detailed_description IS NOT NULL;

-- Commentaires pour la documentation
COMMENT ON COLUMN resources.video_url IS 'URL de la vidéo de démonstration';
COMMENT ON COLUMN resources.image_2_url IS 'URL de la deuxième image';
COMMENT ON COLUMN resources.image_3_url IS 'URL de la troisième image';
COMMENT ON COLUMN resources.image_4_url IS 'URL de la quatrième image';
COMMENT ON COLUMN resources.detailed_description IS 'Description détaillée pour la page de détails';
COMMENT ON COLUMN resources.included_items IS 'Liste JSON des items inclus avec emoji et texte';
COMMENT ON COLUMN resources.faq_question_1 IS 'Première question FAQ';
COMMENT ON COLUMN resources.faq_answer_1 IS 'Première réponse FAQ';
COMMENT ON COLUMN resources.reason_1_title IS 'Titre de la première raison de choisir';
COMMENT ON COLUMN resources.reason_1_text IS 'Texte de la première raison de choisir';