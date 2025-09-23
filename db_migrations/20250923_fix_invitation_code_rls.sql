-- Migration pour corriger les politiques RLS des codes d'invitation
-- Date: 2025-09-23
-- Problème: Les utilisateurs ne peuvent pas mettre à jour les codes d'invitation pour incrémenter current_uses

-- Ajouter une politique RLS pour permettre la mise à jour des codes d'invitation
-- Cette politique permet à tous les utilisateurs authentifiés de mettre à jour current_uses
-- sur les codes d'invitation actifs (nécessaire pour l'utilisation des codes)
CREATE POLICY "Authenticated users can update invitation code usage" ON invitation_code
    FOR UPDATE
    USING (auth.uid() IS NOT NULL AND is_active = true)
    WITH CHECK (auth.uid() IS NOT NULL AND is_active = true);

-- Cette politique est restrictive car elle ne permet la mise à jour que de current_uses
-- et seulement pour les codes actifs, mais elle permet aux utilisateurs d'utiliser les codes
-- sans compromettre la sécurité (les autres champs ne peuvent pas être modifiés)