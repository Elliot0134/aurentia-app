-- Script SQL pour ajouter les nouvelles colonnes à la table resources
-- Exécuter dans Supabase SQL Editor

-- 1. Ajouter les colonnes pour les images supplémentaires et vidéo
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS image_2_url TEXT,
ADD COLUMN IF NOT EXISTS image_3_url TEXT,
ADD COLUMN IF NOT EXISTS image_4_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 2. Ajouter la colonne pour la description détaillée
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS detailed_description TEXT;

-- 3. Ajouter les colonnes FAQ (3 questions + 3 réponses)
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS faq_question_1 TEXT,
ADD COLUMN IF NOT EXISTS faq_answer_1 TEXT,
ADD COLUMN IF NOT EXISTS faq_question_2 TEXT,
ADD COLUMN IF NOT EXISTS faq_answer_2 TEXT,
ADD COLUMN IF NOT EXISTS faq_question_3 TEXT,
ADD COLUMN IF NOT EXISTS faq_answer_3 TEXT;

-- 4. Ajouter les colonnes "Raisons de choisir" (3 titres + 3 textes)
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS reason_1_title TEXT,
ADD COLUMN IF NOT EXISTS reason_1_text TEXT,
ADD COLUMN IF NOT EXISTS reason_2_title TEXT,
ADD COLUMN IF NOT EXISTS reason_2_text TEXT,
ADD COLUMN IF NOT EXISTS reason_3_title TEXT,
ADD COLUMN IF NOT EXISTS reason_3_text TEXT;

-- 5. Ajouter la colonne pour les items inclus (format JSONB)
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS included_items JSONB;

-- 6. Vérifier que les colonnes existent
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'resources' 
AND column_name IN (
    'image_2_url', 'image_3_url', 'image_4_url', 'video_url',
    'detailed_description',
    'faq_question_1', 'faq_answer_1', 'faq_question_2', 'faq_answer_2', 'faq_question_3', 'faq_answer_3',
    'reason_1_title', 'reason_1_text', 'reason_2_title', 'reason_2_text', 'reason_3_title', 'reason_3_text',
    'included_items'
)
ORDER BY column_name;

-- 7. Exemple d'insertion de données de test
INSERT INTO resources (
    id, name, description, detailed_description, category, type, price,
    image_url, image_2_url, 
    faq_question_1, faq_answer_1, faq_question_2, faq_answer_2,
    reason_1_title, reason_1_text, reason_2_title, reason_2_text,
    included_items,
    tags, difficulty, view_count, download_count,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'Template Business Plan Premium',
    'Template professionnel pour business plan complet',
    'Ce template premium vous guide dans la création d''un business plan professionnel de qualité institutionnelle. Développé par des experts en finance d''entreprise, il inclut tous les éléments nécessaires pour convaincre investisseurs et banquiers.',
    'Business Plan',
    'template',
    35,
    'https://example.com/business-plan.jpg',
    'https://example.com/business-plan-2.jpg',
    'Le template est-il compatible avec Word et Google Docs ?',
    'Oui, le template est fourni dans les formats .docx (Word) et Google Docs pour une compatibilité maximale avec tous les logiciels.',
    'Y a-t-il des exemples concrets inclus ?',
    'Absolument ! Le pack contient 3 business plans d''exemple complets dans des secteurs différents (tech, commerce, services).',
    'Template Professionnel',
    'Conçu par des experts financiers, respecte les standards des investisseurs institutionnels.',
    'Guide Pas-à-Pas',
    'Chaque section contient des instructions détaillées et des conseils de rédaction.',
    '[
        {"emoji": "📄", "text": "Template Business Plan (40 pages)"},
        {"emoji": "📊", "text": "Tableaux financiers préformatés (Excel)"},
        {"emoji": "🎯", "text": "Guide de rédaction détaillé"},
        {"emoji": "💡", "text": "3 exemples de business plans"},
        {"emoji": "🎨", "text": "Pack d''icônes et graphiques"},
        {"emoji": "📞", "text": "Support email 30 jours"}
    ]'::jsonb,
    ARRAY['business-plan', 'template', 'finance', 'investissement'],
    'Intermédiaire',
    0,
    0,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 8. Commentaires explicatifs
COMMENT ON COLUMN resources.image_2_url IS 'URL de la deuxième image pour le slider d''images';
COMMENT ON COLUMN resources.image_3_url IS 'URL de la troisième image pour le slider d''images';
COMMENT ON COLUMN resources.image_4_url IS 'URL de la quatrième image pour le slider d''images';
COMMENT ON COLUMN resources.video_url IS 'URL de la vidéo de présentation de la ressource';
COMMENT ON COLUMN resources.detailed_description IS 'Description détaillée affichée dans le modal';
COMMENT ON COLUMN resources.included_items IS 'Liste des items inclus au format JSON: [{"emoji": "✅", "text": "Description"}]';

-- 9. Index pour optimiser les requêtes sur les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_resources_detailed_description ON resources USING gin(to_tsvector('french', detailed_description));
CREATE INDEX IF NOT EXISTS idx_resources_included_items ON resources USING gin(included_items);

-- 10. Validation finale
SELECT 
    COUNT(*) as total_resources,
    COUNT(detailed_description) as with_detailed_description,
    COUNT(included_items) as with_included_items,
    COUNT(faq_question_1) as with_faq,
    COUNT(reason_1_title) as with_reasons
FROM resources;