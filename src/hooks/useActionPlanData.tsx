import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// [Garder toutes les interfaces identiques...]
export interface UserResponses {
  project_id: string;
  user_id: string | null;
  created_at: string;
  roles: string | null;
  budget: string | null;
  type_investissement: string | null;
  date_lancement_prevu: string | null;
  urgence_lancement: string | null;
  prise_de_risque: string | null;
  preference_avancement: string | null;
  ressources_disponibles: string | null;
}

export interface ClassificationProjet {
  project_id: string;
  user_id: string | null;
  created_at: string;
  enjeux_strategiques: string | null;
  contraintes_principales: string | null;
  opportunites_principales: string | null;
  axes_prioritaires: string | null;
  specificites_sectorielles: string | null;
  parametres_recommandes: string | null;
}

export interface Phase {
  project_id: string;
  user_id: string;
  id: string;
  phase_id: string;
  phase_index: number;
  ordre_execution: number;
  nom_phase: string;
  objectif_principal: string | null;
  duree_mois: string | null;
  periode: string | null;
  focus_sectoriel: string | null;
  budget_minimum: number;
  budget_optimal: number;
  livrables_majeurs: any[];
  ressources_cles: any[];
  risques_phase: any[];
  statut: 'À faire' | 'En cours' | 'Terminé';
  created_at: string;
  updated_at: string;
}

export interface Jalon {
  project_id: string;
  user_id: string;
  id: string;
  jalon_id: string;
  jalon_index: number;
  phase_parent_id: string;
  jalon_nom: string;
  semaine: string | null;
  semaine_cible: string | null;
  condition_validation: string | null;
  criticite: 'Critique' | 'Important' | 'Normal' | 'Bloquante' | 'Élevée' | 'Modérée';
  impact_si_echec: string | null;
  responsable_validation: string | null;
  statut: 'À faire' | 'En cours' | 'Terminé';
  created_at: string;
  updated_at: string;
}

export interface Tache {
  project_id: string;
  user_id: string;
  id: string;
  tache_id: string;
  tache_index: number;
  phase_parent_id: string;
  jalon_parent_id: string | null;
  ordre_execution: number;
  nom_tache: string;
  description_detaillee: string | null;
  priorite: string | null;
  criticite_justification: string | null;
  responsables: any[];
  duree_estimee: string | null;
  livrables: any[];
  criteres_validation: any[];
  dependances_taches: any[];
  risques: any[];
  outils_necessaires: any[];
  competences_requises: any[];
  recommandations_pratiques: string | null;
  statut: 'À faire' | 'En cours' | 'Terminé';
  created_at: string;
  updated_at: string;
}

export interface Livrable {
  project_id: string;
  user_id: string;
  id: string;
  livrable_id: string;
  phase_parent_id: string;
  tache_parent_id: string | null;
  livrable_nom: string;
  format_attendu: string | null;
  criteres_qualite: any[];
  validateur: string | null;
  statut: 'À faire' | 'En cours' | 'Terminé';
  created_at: string;
  updated_at: string;
  nom_phase?: string;
  nom_tache?: string | null;
}

export interface HierarchicalElement {
  id: string;
  element_id: string;
  type: 'phase' | 'jalon' | 'tache';
  level: number;
  nom: string;
  objectif_principal: string;
  duree: string;
  periode: string;
  statut: 'À faire' | 'En cours' | 'Terminé';
  criticite: string | null;
  responsable: string | null;
  parent_phase: string | null;
  parent_jalon: string | null;
  sort_primary: number;
  sort_secondary: number;
  sort_tertiary: number;
  focus_sectoriel?: string;
  budget_minimum?: number;
  budget_optimal?: number;
  livrables_majeurs?: any[];
  ressources_cles?: any[];
  risques_phase?: any[];
  impact_si_echec?: string;
  criteres_validation?: any[];
  dependances_taches?: any[];
  outils_necessaires?: any[];
  recommandations_pratiques?: string;
  created_at: string;
  updated_at: string;
}

export interface ActionPlanData {
  userResponses: UserResponses | null;
  classificationProjet: ClassificationProjet | null;
  phases: Phase[];
  jalons: Jalon[];
  taches: Tache[];
  livrables: Livrable[];
  hierarchicalData: HierarchicalElement[];
}

export const useActionPlanData = (projectId: string | null) => {
  const [data, setData] = useState<ActionPlanData>({
    userResponses: null,
    classificationProjet: null,
    phases: [],
    jalons: [],
    taches: [],
    livrables: [],
    hierarchicalData: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildHierarchicalData = (phases: Phase[], jalons: Jalon[], taches: Tache[]): HierarchicalElement[] => {
    const hierarchical: HierarchicalElement[] = [];

    phases.forEach(phase => {
      hierarchical.push({
        id: phase.id,
        element_id: phase.phase_id,
        type: 'phase',
        level: 0,
        nom: phase.nom_phase,
        objectif_principal: phase.objectif_principal || '',
        duree: phase.duree_mois || '',
        periode: phase.periode || '',
        statut: phase.statut,
        criticite: null,
        responsable: null,
        parent_phase: null,
        parent_jalon: null,
        sort_primary: phase.ordre_execution,
        sort_secondary: 0,
        sort_tertiary: 0,
        focus_sectoriel: phase.focus_sectoriel,
        budget_minimum: phase.budget_minimum,
        budget_optimal: phase.budget_optimal,
        livrables_majeurs: phase.livrables_majeurs,
        ressources_cles: phase.ressources_cles,
        risques_phase: phase.risques_phase,
        created_at: phase.created_at,
        updated_at: phase.updated_at
      });

      jalons
        .filter(jalon => jalon.phase_parent_id === phase.phase_id)
        .forEach(jalon => {
          hierarchical.push({
            id: jalon.id,
            element_id: jalon.jalon_id,
            type: 'jalon',
            level: 1,
            nom: jalon.jalon_nom,
            objectif_principal: jalon.condition_validation || '',
            duree: jalon.semaine || '',
            periode: jalon.semaine_cible || '',
            statut: jalon.statut,
            criticite: jalon.criticite,
            responsable: jalon.responsable_validation,
            parent_phase: jalon.phase_parent_id,
            parent_jalon: null,
            sort_primary: phase.ordre_execution,
            sort_secondary: jalon.jalon_index,
            sort_tertiary: 0,
            impact_si_echec: jalon.impact_si_echec,
            created_at: jalon.created_at,
            updated_at: jalon.updated_at
          });

          taches
            .filter(tache => tache.jalon_parent_id === jalon.jalon_id)
            .forEach(tache => {
              hierarchical.push({
                id: tache.id,
                element_id: tache.tache_id,
                type: 'tache',
                level: 2,
                nom: tache.nom_tache,
                objectif_principal: tache.description_detaillee || '',
                duree: tache.duree_estimee || '',
                periode: tache.priorite || '',
                statut: tache.statut,
                criticite: tache.priorite,
                responsable: Array.isArray(tache.responsables) ? tache.responsables.join(', ') : '',
                parent_phase: tache.phase_parent_id,
                parent_jalon: tache.jalon_parent_id,
                sort_primary: phase.ordre_execution,
                sort_secondary: jalon.jalon_index,
                sort_tertiary: tache.ordre_execution,
                criteres_validation: tache.criteres_validation,
                dependances_taches: tache.dependances_taches,
                outils_necessaires: tache.outils_necessaires,
                recommandations_pratiques: tache.recommandations_pratiques,
                created_at: tache.created_at,
                updated_at: tache.updated_at
              });
            });
        });
    });

    taches
      .filter(tache => !tache.jalon_parent_id)
      .forEach(tache => {
        const phase = phases.find(p => p.phase_id === tache.phase_parent_id);
        if (phase) {
          hierarchical.push({
            id: tache.id,
            element_id: tache.tache_id,
            type: 'tache',
            level: 1,
            nom: tache.nom_tache,
            objectif_principal: tache.description_detaillee || '',
            duree: tache.duree_estimee || '',
            periode: tache.priorite || '',
            statut: tache.statut,
            criticite: tache.priorite,
            responsable: Array.isArray(tache.responsables) ? tache.responsables.join(', ') : '',
            parent_phase: tache.phase_parent_id,
            parent_jalon: null,
            sort_primary: phase.ordre_execution,
            sort_secondary: tache.ordre_execution,
            sort_tertiary: 0,
            criteres_validation: tache.criteres_validation,
            dependances_taches: tache.dependances_taches,
            outils_necessaires: tache.outils_necessaires,
            recommandations_pratiques: tache.recommandations_pratiques,
            created_at: tache.created_at,
            updated_at: tache.updated_at
          });
        }
      });

    return hierarchical.sort((a, b) => {
      if (a.sort_primary !== b.sort_primary) return a.sort_primary - b.sort_primary;
      if (a.sort_secondary !== b.sort_secondary) return a.sort_secondary - b.sort_secondary;
      return a.sort_tertiary - b.sort_tertiary;
    });
  };

  const fetchActionPlanData = async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Récupération des données via RPC pour le projet:', projectId);

      // 🎯 UTILISER LES FONCTIONS RPC CRÉÉES (sans toucher la structure)

      // Récupérer les user_responses via RPC
      const { data: userResponses, error: userError } = await supabase
        .rpc('get_action_plan_user_responses', { project_uuid: projectId });

      if (userError) {
        console.error('❌ Erreur user_responses:', userError);
        throw userError;
      }
      const userResponsesData = userResponses?.[0] || null;
      console.log('✅ User responses récupérées:', !!userResponsesData);

      // Récupérer la classification via RPC
      const { data: classification, error: classificationError } = await supabase
        .rpc('get_action_plan_classification', { project_uuid: projectId });

      if (classificationError) {
        console.error('❌ Erreur classification:', classificationError);
        throw classificationError;
      }
      const classificationData = classification?.[0] || null;
      console.log('✅ Classification récupérée:', !!classificationData);

      // Récupérer les phases via RPC
      const { data: phases, error: phasesError } = await supabase
        .rpc('get_action_plan_phases', { project_uuid: projectId });

      if (phasesError) {
        console.error('❌ Erreur phases:', phasesError);
        throw phasesError;
      }
      console.log('✅ Phases récupérées:', phases?.length || 0);

      // Récupérer les jalons via RPC
      const { data: jalons, error: jalonsError } = await supabase
        .rpc('get_action_plan_jalons', { project_uuid: projectId });

      if (jalonsError) {
        console.error('❌ Erreur jalons:', jalonsError);
        throw jalonsError;
      }
      console.log('✅ Jalons récupérés:', jalons?.length || 0);

      // Récupérer les tâches via RPC
      const { data: taches, error: tachesError } = await supabase
        .rpc('get_action_plan_taches', { project_uuid: projectId });

      if (tachesError) {
        console.error('❌ Erreur tâches:', tachesError);
        throw tachesError;
      }
      console.log('✅ Tâches récupérées:', taches?.length || 0);

      // Récupérer les livrables via RPC
      const { data: livrables, error: livrablesError } = await supabase
        .rpc('get_action_plan_livrables', { project_uuid: projectId });

      if (livrablesError) {
        console.error('❌ Erreur livrables:', livrablesError);
        throw livrablesError;
      }
      console.log('✅ Livrables récupérés:', livrables?.length || 0);

      // Enrichir les livrables avec les noms des phases et tâches
      const livrablesWithNames = (livrables || []).map(livrable => {
        const phase = phases?.find(p => p.phase_id === livrable.phase_parent_id);
        const tache = taches?.find(t => t.tache_id === livrable.tache_parent_id);
        
        return {
          ...livrable,
          nom_phase: phase?.nom_phase || null,
          nom_tache: tache?.nom_tache || null
        };
      });

      // Construire la structure hiérarchique
      const hierarchicalData = buildHierarchicalData(phases || [], jalons || [], taches || []);

      console.log('🎯 Données finales construites via RPC:', {
        userResponses: !!userResponsesData,
        classificationProjet: !!classificationData,
        phases: phases?.length || 0,
        jalons: jalons?.length || 0,
        taches: taches?.length || 0,
        livrables: livrablesWithNames?.length || 0,
        hierarchicalData: hierarchicalData?.length || 0
      });

      setData({
        userResponses: userResponsesData,
        classificationProjet: classificationData,
        phases: phases || [],
        jalons: jalons || [],
        taches: taches || [],
        livrables: livrablesWithNames || [],
        hierarchicalData
      });

    } catch (err: any) {
      console.error('💥 Erreur complète:', err);
      setError(`Erreur de chargement: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchActionPlanData();
    }
  }, [projectId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchActionPlanData
  };
};