-- =====================================================
-- FONCTIONS SQL POUR LA GESTION DU PLAN D'ACTION
-- =====================================================

-- =====================================================
-- FONCTION POUR METTRE À JOUR LE STATUT D'UNE TÂCHE
-- IMPORTANT: Cette fonction doit être dans le schéma public pour être accessible via RPC
-- et l'ordre des paramètres doit correspondre aux types TypeScript
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_action_plan_tache_status(
  p_new_statut TEXT,
  p_tache_id TEXT
) RETURNS VOID AS $$
BEGIN
  -- Vérifier que le nouveau statut est valide
  IF p_new_statut NOT IN ('À faire', 'En cours', 'Terminé') THEN
    RAISE EXCEPTION 'Statut invalide: %', p_new_statut;
  END IF;
  
  -- Mettre à jour le statut de la tâche
  UPDATE action_plan.taches
  SET
    statut = p_new_statut,
    updated_at = now()
  WHERE tache_id = p_tache_id;
  
  -- Vérifier si la tâche existe
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tâche non trouvée: %', p_tache_id;
  END IF;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTION POUR METTRE À JOUR LE STATUT D'UN JALON
-- =====================================================

CREATE OR REPLACE FUNCTION update_action_plan_jalon_status(
  p_jalon_id TEXT,
  p_new_statut TEXT
) RETURNS VOID AS $$
BEGIN
  -- Vérifier que le nouveau statut est valide
  IF p_new_statut NOT IN ('À faire', 'En cours', 'Terminé') THEN
    RAISE EXCEPTION 'Statut invalide: %', p_new_statut;
  END IF;
  
  -- Mettre à jour le statut du jalon
  UPDATE action_plan.jalons 
  SET 
    statut = p_new_statut,
    updated_at = now()
  WHERE jalon_id = p_jalon_id;
  
  -- Vérifier si le jalon existe
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Jalon non trouvé: %', p_jalon_id;
  END IF;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTION POUR METTRE À JOUR LE STATUT D'UNE PHASE
-- =====================================================

CREATE OR REPLACE FUNCTION update_action_plan_phase_status(
  p_phase_id TEXT,
  p_new_statut TEXT
) RETURNS VOID AS $$
BEGIN
  -- Vérifier que le nouveau statut est valide
  IF p_new_statut NOT IN ('À faire', 'En cours', 'Terminé') THEN
    RAISE EXCEPTION 'Statut invalide: %', p_new_statut;
  END IF;
  
  -- Mettre à jour le statut de la phase
  UPDATE action_plan.phases 
  SET 
    statut = p_new_statut,
    updated_at = now()
  WHERE phase_id = p_phase_id;
  
  -- Vérifier si la phase existe
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Phase non trouvée: %', p_phase_id;
  END IF;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTION POUR CALCULER LE STATUT D'UN JALON BASÉ SUR SES TÂCHES
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_jalon_status(jalon_id_param TEXT)
RETURNS TEXT AS $$
DECLARE
  total_taches INTEGER;
  taches_terminees INTEGER;
  taches_en_cours INTEGER;
  nouveau_statut TEXT;
BEGIN
  -- Compter le total des tâches pour ce jalon
  SELECT COUNT(*) INTO total_taches
  FROM action_plan.taches 
  WHERE jalon_parent_id = jalon_id_param;
  
  -- Si aucune tâche, le statut reste inchangé
  IF total_taches = 0 THEN
    SELECT statut INTO nouveau_statut
    FROM action_plan.jalons
    WHERE jalon_id = jalon_id_param;
    RETURN COALESCE(nouveau_statut, 'À faire');
  END IF;
  
  -- Compter les tâches terminées
  SELECT COUNT(*) INTO taches_terminees
  FROM action_plan.taches 
  WHERE jalon_parent_id = jalon_id_param 
    AND statut = 'Terminé';
  
  -- Compter les tâches en cours
  SELECT COUNT(*) INTO taches_en_cours
  FROM action_plan.taches 
  WHERE jalon_parent_id = jalon_id_param 
    AND statut = 'En cours';
  
  -- Déterminer le statut
  IF taches_terminees = total_taches THEN
    nouveau_statut := 'Terminé';
  ELSIF taches_en_cours > 0 OR taches_terminees > 0 THEN
    nouveau_statut := 'En cours';
  ELSE
    nouveau_statut := 'À faire';
  END IF;
  
  -- Mettre à jour le statut du jalon
  UPDATE action_plan.jalons 
  SET statut = nouveau_statut, updated_at = now()
  WHERE jalon_id = jalon_id_param;
  
  RETURN nouveau_statut;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTION POUR CALCULER LE STATUT D'UNE PHASE BASÉ SUR SES JALONS ET TÂCHES
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_phase_status(phase_id_param TEXT)
RETURNS TEXT AS $$
DECLARE
  total_jalons INTEGER;
  jalons_termines INTEGER;
  jalons_en_cours INTEGER;
  total_taches_directes INTEGER;
  taches_directes_terminees INTEGER;
  taches_directes_en_cours INTEGER;
  nouveau_statut TEXT;
BEGIN
  -- Compter le total des jalons pour cette phase
  SELECT COUNT(*) INTO total_jalons
  FROM action_plan.jalons 
  WHERE phase_parent_id = phase_id_param;
  
  -- Compter les tâches directement liées à la phase (sans jalon parent)
  SELECT COUNT(*) INTO total_taches_directes
  FROM action_plan.taches 
  WHERE phase_parent_id = phase_id_param 
    AND jalon_parent_id IS NULL;
  
  -- Si ni jalons ni tâches directes, le statut reste inchangé
  IF total_jalons = 0 AND total_taches_directes = 0 THEN
    SELECT statut INTO nouveau_statut
    FROM action_plan.phases
    WHERE phase_id = phase_id_param;
    RETURN COALESCE(nouveau_statut, 'À faire');
  END IF;
  
  -- Compter les jalons terminés et en cours
  SELECT COUNT(*) INTO jalons_termines
  FROM action_plan.jalons 
  WHERE phase_parent_id = phase_id_param 
    AND statut = 'Terminé';
    
  SELECT COUNT(*) INTO jalons_en_cours
  FROM action_plan.jalons 
  WHERE phase_parent_id = phase_id_param 
    AND statut = 'En cours';
  
  -- Compter les tâches directes terminées et en cours
  SELECT COUNT(*) INTO taches_directes_terminees
  FROM action_plan.taches 
  WHERE phase_parent_id = phase_id_param 
    AND jalon_parent_id IS NULL
    AND statut = 'Terminé';
    
  SELECT COUNT(*) INTO taches_directes_en_cours
  FROM action_plan.taches 
  WHERE phase_parent_id = phase_id_param 
    AND jalon_parent_id IS NULL
    AND statut = 'En cours';
  
  -- Déterminer le statut
  IF (jalons_termines = total_jalons) AND (taches_directes_terminees = total_taches_directes) THEN
    nouveau_statut := 'Terminé';
  ELSIF (jalons_en_cours > 0 OR jalons_termines > 0) OR (taches_directes_en_cours > 0 OR taches_directes_terminees > 0) THEN
    nouveau_statut := 'En cours';
  ELSE
    nouveau_statut := 'À faire';
  END IF;
  
  -- Mettre à jour le statut de la phase
  UPDATE action_plan.phases 
  SET statut = nouveau_statut, updated_at = now()
  WHERE phase_id = phase_id_param;
  
  RETURN nouveau_statut;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTIONS RPC POUR RÉCUPÉRER LES DONNÉES DU PLAN D'ACTION
-- Ces fonctions sont probablement déjà créées, mais ajoutées pour complétion
-- =====================================================

-- Fonction pour récupérer les réponses utilisateur
CREATE OR REPLACE FUNCTION get_action_plan_user_responses(project_uuid TEXT)
RETURNS TABLE(
  project_id TEXT,
  user_id TEXT,
  created_at TEXT,
  roles TEXT,
  budget TEXT,
  type_investissement TEXT,
  date_lancement_prevu TEXT,
  urgence_lancement TEXT,
  prise_de_risque TEXT,
  preference_avancement TEXT,
  ressources_disponibles TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.project_id::TEXT,
    ur.user_id::TEXT,
    ur.created_at::TEXT,
    ur.roles,
    ur.budget,
    ur.type_investissement,
    ur.date_lancement_prevu,
    ur.urgence_lancement,
    ur.prise_de_risque,
    ur.preference_avancement,
    ur.ressources_disponibles
  FROM action_plan.user_responses ur
  WHERE ur.project_id = project_uuid::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer la classification du projet
CREATE OR REPLACE FUNCTION get_action_plan_classification(project_uuid TEXT)
RETURNS TABLE(
  project_id TEXT,
  user_id TEXT,
  created_at TEXT,
  enjeux_strategiques TEXT,
  contraintes_principales TEXT,
  opportunites_principales TEXT,
  axes_prioritaires TEXT,
  specificites_sectorielles TEXT,
  parametres_recommandes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.project_id::TEXT,
    cp.user_id::TEXT,
    cp.created_at::TEXT,
    cp.enjeux_strategiques,
    cp.contraintes_principales,
    cp.opportunites_principales,
    cp.axes_prioritaires,
    cp.specificites_sectorielles,
    cp.parametres_recommandes
  FROM action_plan.classification_projet cp
  WHERE cp.project_id = project_uuid::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer les phases
CREATE OR REPLACE FUNCTION get_action_plan_phases(project_uuid TEXT)
RETURNS TABLE(
  project_id TEXT,
  user_id TEXT,
  id TEXT,
  phase_id TEXT,
  phase_index INTEGER,
  ordre_execution INTEGER,
  nom_phase TEXT,
  objectif_principal TEXT,
  duree_mois TEXT,
  periode TEXT,
  focus_sectoriel TEXT,
  budget_minimum INTEGER,
  budget_optimal INTEGER,
  livrables_majeurs JSONB,
  ressources_cles JSONB,
  risques_phase JSONB,
  statut TEXT,
  created_at TEXT,
  updated_at TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.project_id::TEXT,
    p.user_id::TEXT,
    p.id::TEXT,
    p.phase_id,
    p.phase_index,
    p.ordre_execution,
    p.nom_phase,
    p.objectif_principal,
    p.duree_mois,
    p.periode,
    p.focus_sectoriel,
    p.budget_minimum,
    p.budget_optimal,
    p.livrables_majeurs::JSONB,
    p.ressources_cles::JSONB,
    p.risques_phase::JSONB,
    p.statut,
    p.created_at::TEXT,
    p.updated_at::TEXT
  FROM action_plan.phases p
  WHERE p.project_id = project_uuid::UUID
  ORDER BY p.ordre_execution;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer les jalons
CREATE OR REPLACE FUNCTION get_action_plan_jalons(project_uuid TEXT)
RETURNS TABLE(
  project_id TEXT,
  user_id TEXT,
  id TEXT,
  jalon_id TEXT,
  jalon_index INTEGER,
  phase_parent_id TEXT,
  jalon_nom TEXT,
  semaine TEXT,
  semaine_cible TEXT,
  condition_validation TEXT,
  criticite TEXT,
  impact_si_echec TEXT,
  responsable_validation TEXT,
  statut TEXT,
  created_at TEXT,
  updated_at TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.project_id::TEXT,
    j.user_id::TEXT,
    j.id::TEXT,
    j.jalon_id,
    j.jalon_index,
    j.phase_parent_id,
    j.jalon_nom,
    j.semaine,
    j.semaine_cible,
    j.condition_validation,
    j.criticite,
    j.impact_si_echec,
    j.responsable_validation,
    j.statut,
    j.created_at::TEXT,
    j.updated_at::TEXT
  FROM action_plan.jalons j
  WHERE j.project_id = project_uuid::UUID
  ORDER BY j.jalon_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer les tâches
CREATE OR REPLACE FUNCTION get_action_plan_taches(project_uuid TEXT)
RETURNS TABLE(
  project_id TEXT,
  user_id TEXT,
  id TEXT,
  tache_id TEXT,
  tache_index INTEGER,
  phase_parent_id TEXT,
  jalon_parent_id TEXT,
  ordre_execution INTEGER,
  nom_tache TEXT,
  description_detaillee TEXT,
  priorite TEXT,
  criticite_justification TEXT,
  responsables JSONB,
  duree_estimee TEXT,
  livrables JSONB,
  criteres_validation JSONB,
  dependances_taches JSONB,
  risques JSONB,
  outils_necessaires JSONB,
  competences_requises JSONB,
  recommandations_pratiques TEXT,
  statut TEXT,
  created_at TEXT,
  updated_at TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.project_id::TEXT,
    t.user_id::TEXT,
    t.id::TEXT,
    t.tache_id,
    t.tache_index,
    t.phase_parent_id,
    t.jalon_parent_id,
    t.ordre_execution,
    t.nom_tache,
    t.description_detaillee,
    t.priorite,
    t.criticite_justification,
    t.responsables::JSONB,
    t.duree_estimee,
    t.livrables::JSONB,
    t.criteres_validation::JSONB,
    t.dependances_taches::JSONB,
    t.risques::JSONB,
    t.outils_necessaires::JSONB,
    t.competences_requises::JSONB,
    t.recommandations_pratiques,
    t.statut,
    t.created_at::TEXT,
    t.updated_at::TEXT
  FROM action_plan.taches t
  WHERE t.project_id = project_uuid::UUID
  ORDER BY t.ordre_execution;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer les livrables
CREATE OR REPLACE FUNCTION get_action_plan_livrables(project_uuid TEXT)
RETURNS TABLE(
  project_id TEXT,
  user_id TEXT,
  id TEXT,
  livrable_id TEXT,
  phase_parent_id TEXT,
  tache_parent_id TEXT,
  livrable_nom TEXT,
  format_attendu TEXT,
  criteres_qualite JSONB,
  validateur TEXT,
  statut TEXT,
  created_at TEXT,
  updated_at TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.project_id::TEXT,
    l.user_id::TEXT,
    l.id::TEXT,
    l.livrable_id,
    l.phase_parent_id,
    l.tache_parent_id,
    l.livrable_nom,
    l.format_attendu,
    l.criteres_qualite::JSONB,
    l.validateur,
    l.statut,
    l.created_at::TEXT,
    l.updated_at::TEXT
  FROM action_plan.livrables l
  WHERE l.project_id = project_uuid::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;