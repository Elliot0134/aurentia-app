import { useState, useEffect, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface FreeDeliverableStatus {
  key: string;
  id: string;
  name: string;
  status: string | null;
  icon: string;
  color: string;
  status_score_viabilite?: string | null; // Ajout du statut du score de viabilité
}

export const useFreeDeliverableProgress = (projectId: string | undefined, isActive: boolean = true) => {
  const [isLoading, setIsLoading] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startDelayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Configuration des livrables gratuits avec leurs icônes et couleurs
  const deliverablesConfig: Omit<FreeDeliverableStatus, 'status'>[] = [
    {
      key: 'persona_express',
      id: 'statut_persona_express',
      name: 'Persona Express',
      icon: '/icones-livrables/persona-icon.png',
      color: '#e74c3c'
    },
    {
      key: 'mini_swot',
      id: 'statut_mini_swot',
      name: 'Mini SWOT',
      icon: '/icones-livrables/market-icon.png',
      color: '#3498db'
    },
    {
      key: 'success_story',
      id: 'statut_success_story',
      name: 'Success Story',
      icon: '/icones-livrables/story-icon.png',
      color: '#9b59b6'
    },
    {
      key: 'pitch',
      id: 'statut_pitch',
      name: 'Pitch',
      icon: '/icones-livrables/pitch-icon.png',
      color: '#57a68b'
    },
    {
      key: 'vision_mission_valeurs',
      id: 'statut_vision_mission_valeurs',
      name: 'Vision, Mission & Valeurs',
      icon: '/icones-livrables/vision-icon.png',
      color: '#f39c12'
    },
    {
      key: 'juridique',
      id: 'statut_juridique',
      name: 'Cadre juridique',
      icon: '/icones-livrables/juridique-icon.png',
      color: '#8e44ad' // Couleur arbitraire, peut être ajustée
    },
    {
      key: 'note_globale',
      id: 'status_score_viabilite',
      name: 'Note globale',
      icon: '/icones-livrables/score-icon.png', // Icône mise à jour
      color: '#FFD700' // Couleur arbitraire
    }
  ];

  // Initialiser avec les livrables et statut null par défaut
  const [deliverables, setDeliverables] = useState<FreeDeliverableStatus[]>(
    deliverablesConfig.map(config => ({ ...config, status: null }))
  );

  const fetchDeliverableStatuses = async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      console.log('🔍 [FREE DELIVERABLES] Récupération des statuts pour projectId:', projectId);
      
      const { data, error } = await supabase
        .from('project_summary')
        .select('statut_persona_express, statut_mini_swot, statut_success_story, statut_pitch, statut_vision_mission_valeurs, statut_juridique, status_score_viabilite')
        .eq('project_id', projectId)
        .single();

      console.log('📊 [FREE DELIVERABLES] Réponse Supabase:', { data, error });

      if (error) {
        console.error('❌ [FREE DELIVERABLES] Erreur lors de la récupération des statuts:', error);
        return;
      }

      if (data) {
        console.log('✅ [FREE DELIVERABLES] Données récupérées:', data);
        
        const updatedDeliverables = deliverablesConfig.map(config => ({
          ...config,
          status: (data[config.id as keyof typeof data] !== null && data[config.id as keyof typeof data] !== undefined)
                    ? String(data[config.id as keyof typeof data])
                    : null
        }));
        
        console.log('📋 [FREE DELIVERABLES] Livrables mis à jour:', updatedDeliverables);
        setDeliverables(updatedDeliverables);
      }
    } catch (error) {
      console.error('💥 [FREE DELIVERABLES] Erreur lors de la récupération des statuts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = () => {
    if (!projectId || !isActive) return;

    console.log('🔄 [FREE DELIVERABLES] Démarrage du polling pour projectId:', projectId);
    console.log('⏳ [FREE DELIVERABLES] Attente de 5 secondes pour la création de la table project_summary...');
    
    // Attendre 5 secondes avant de commencer le polling pour laisser le temps au workflow N8N de créer la table
    startDelayTimeoutRef.current = setTimeout(() => {
      console.log('✅ [FREE DELIVERABLES] Début du polling après délai d\'attente');
      
      // Récupération initiale
      fetchDeliverableStatuses();

      // Polling toutes les 4 secondes
      pollingIntervalRef.current = setInterval(() => {
        console.log('⏰ [FREE DELIVERABLES] Polling en cours...');
        fetchDeliverableStatuses();
      }, 4000);
      
      startDelayTimeoutRef.current = null;
    }, 5000);
  };

  const stopPolling = () => {
    // Arrêter le timeout de démarrage s'il est en cours
    if (startDelayTimeoutRef.current) {
      console.log('⏹️ [FREE DELIVERABLES] Annulation du délai de démarrage');
      clearTimeout(startDelayTimeoutRef.current);
      startDelayTimeoutRef.current = null;
    }
    
    // Arrêter le polling s'il est en cours
    if (pollingIntervalRef.current) {
      console.log('⏹️ [FREE DELIVERABLES] Arrêt du polling');
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Vérifier si tous les livrables sont terminés
  const areAllDeliverablesCompleted = () => {
    return deliverables.length > 0 && deliverables.every(deliverable => 
      deliverable.status === 'completed' || deliverable.status === 'terminé'
    );
  };

  // Compter les livrables terminés
  const getCompletedCount = () => {
    return deliverables.filter(deliverable => 
      deliverable.status === 'completed' || deliverable.status === 'terminé'
    ).length;
  };

  useEffect(() => {
    console.log('🔧 [FREE DELIVERABLES] Hook effect - projectId:', projectId, 'isActive:', isActive);
    
    if (isActive && projectId) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [projectId, isActive]);

  return {
    deliverables,
    isLoading,
    error: null,
    areAllDeliverablesCompleted: areAllDeliverablesCompleted(),
    completedCount: getCompletedCount(),
    totalCount: deliverables.length,
    refetch: fetchDeliverableStatuses
  };
};
