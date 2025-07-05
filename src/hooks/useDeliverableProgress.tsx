import { useState, useEffect, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface DeliverableStatus {
  key: string;
  id: string;
  name: string;
  status: string | null;
  icon: string;
  color: string;
}

export const useDeliverableProgress = (projectId: string | undefined, isActive: boolean = true) => {
  const [deliverables, setDeliverables] = useState<DeliverableStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Configuration des livrables avec leurs icônes et couleurs
  const deliverablesConfig: Omit<DeliverableStatus, 'status'>[] = [
    {
      key: 'concurrence',
      id: 'statut_concurrence',
      name: 'Concurrence',
      icon: '🏢',
      color: '#e74c3c'
    },
    {
      key: 'pestel',
      id: 'statut_pestel',
      name: 'Analyse de marché (PESTEL)',
      icon: '📊',
      color: '#3498db'
    },
    {
      key: 'proposition_valeur',
      id: 'statut_proposition_valeur',
      name: 'Proposition de valeur',
      icon: '💎',
      color: '#9b59b6'
    },
    {
      key: 'business_model',
      id: 'statut_business_model',
      name: 'Business model',
      icon: '💼',
      color: '#57a68b'
    },
    {
      key: 'ressources',
      id: 'statut_ressources',
      name: 'Analyse des ressources',
      icon: '⚙️',
      color: '#f39c12'
    }
  ];

  const fetchDeliverableStatuses = async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('project_summary')
        .select('statut_concurrence, statut_pestel, statut_proposition_valeur, statut_business_model, statut_ressources')
        .eq('project_id', projectId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération des statuts:', error);
        return;
      }

      if (data) {
        const updatedDeliverables = deliverablesConfig.map(config => ({
          ...config,
          status: data[config.id as keyof typeof data] || null
        }));
        
        setDeliverables(updatedDeliverables);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statuts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = () => {
    if (!projectId || !isActive) return;

    console.log('🔄 Démarrage du polling des statuts de livrables');
    
    // Récupération initiale
    fetchDeliverableStatuses();

    // Polling toutes les 4 secondes
    pollingIntervalRef.current = setInterval(() => {
      fetchDeliverableStatuses();
    }, 4000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      console.log('⏹️ Arrêt du polling des statuts de livrables');
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
    error: null, // Ajout de la propriété error pour la compatibilité
    areAllDeliverablesCompleted: areAllDeliverablesCompleted(),
    completedCount: getCompletedCount(),
    totalCount: deliverables.length,
    refetch: fetchDeliverableStatuses
  };
};