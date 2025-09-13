-- =====================================================
-- FONCTION SIMPLE POUR METTRE À JOUR LE STATUT D'UNE TÂCHE
-- Cette fonction doit être dans le schéma public pour être accessible via RPC
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_tache_status(
  tache_id_param TEXT,
  nouveau_statut TEXT
) RETURNS JSONB AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  -- Vérifier que le nouveau statut est valide
  IF nouveau_statut NOT IN ('À faire', 'En cours', 'Terminé') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Statut invalide: ' || nouveau_statut
    );
  END IF;
  
  -- Mettre à jour le statut de la tâche
  UPDATE action_plan.taches 
  SET 
    statut = nouveau_statut,
    updated_at = now()
  WHERE tache_id = tache_id_param;
  
  -- Récupérer le nombre de lignes affectées
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  -- Vérifier si la tâche a été trouvée et mise à jour
  IF rows_affected = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tâche non trouvée: ' || tache_id_param
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Statut mis à jour avec succès',
    'tache_id', tache_id_param,
    'nouveau_statut', nouveau_statut,
    'rows_affected', rows_affected
  );
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optionnel: Donner les permissions nécessaires
-- GRANT EXECUTE ON FUNCTION public.update_tache_status TO authenticated;