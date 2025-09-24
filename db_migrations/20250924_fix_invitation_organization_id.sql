-- Migration pour corriger les invitations sans organization_id
-- Date: 2025-09-24

-- Mettre à jour les invitations qui n'ont pas organization_id défini
-- en utilisant l'organisation du créateur de l'invitation
UPDATE invitation_code
SET organization_id = profiles.organization_id
FROM profiles
WHERE invitation_code.created_by = profiles.id
AND invitation_code.organization_id IS NULL;

-- Supprimer les invitations qui n'ont toujours pas d'organisation_id
-- (celles dont le créateur n'a pas d'organisation)
DELETE FROM invitation_code
WHERE organization_id IS NULL;

-- Vérifier que toutes les invitations ont maintenant une organization_id
-- Cette requête devrait retourner 0 lignes après la migration
-- SELECT COUNT(*) as invitations_without_org FROM invitation_code WHERE organization_id IS NULL;

COMMENT ON TABLE invitation_code IS 'Codes d''invitation pour rejoindre les organisations - organization_id requis';