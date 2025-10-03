import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HierarchicalElement } from '@/hooks/useActionPlanData';
import { 
  ChevronRight, 
  Layers3,
  Clock,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  FolderOpen,
  Flag,
  CircleCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// CSS pour l'alignement parfait des colonnes
const columnStyles = `
  .table-column-tache { width: 430px; min-width: 430px; max-width: 430px; }
  .table-column-statut { width: 160px; min-width: 160px; max-width: 160px; }
  .table-column-responsable { width: 210px; min-width: 210px; max-width: 210px; }
  .table-column-duree { width: 80px; min-width: 80px; max-width: 80px; }
`;

// Couleurs pastel pour les responsables
const pastelColors = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-yellow-100 text-yellow-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
];

// StatusBadge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Terminé':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'En cours':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'À faire':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

// StatusDropdown pour changer le statut
const StatusDropdown = ({ 
  currentStatus, 
  taskId, 
  onStatusChange 
}: { 
  currentStatus: string;
  taskId: string;
  onStatusChange: (taskId: string, newStatus: 'À faire' | 'En cours' | 'Terminé') => void;
}) => {
  const statuses: ('À faire' | 'En cours' | 'Terminé')[] = ['À faire', 'En cours', 'Terminé'];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex cursor-pointer">
          <StatusBadge status={currentStatus} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {statuses.map((status) => (
          <DropdownMenuItem 
            key={status}
            onClick={() => onStatusChange(taskId, status)}
            className={currentStatus === status ? 'bg-gray-100' : ''}
          >
            {status}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ResponsableTag pour afficher les responsables avec couleurs uniques
const ResponsableTag = ({ responsable }: { responsable: string }) => {
  if (!responsable) return null;
  
  // Fonction pour générer une couleur basée sur le nom
  const getResponsableColor = (name: string) => {
    const colors = [
      'bg-blue-50 text-blue-700 border-blue-200',
      'bg-green-50 text-green-700 border-green-200',
      'bg-purple-50 text-purple-700 border-purple-200',
      'bg-orange-50 text-orange-700 border-orange-200',
      'bg-pink-50 text-pink-700 border-pink-200',
      'bg-indigo-50 text-indigo-700 border-indigo-200',
      'bg-teal-50 text-teal-700 border-teal-200',
      'bg-red-50 text-red-700 border-red-200',
    ];
    
    // Hash simple du nom pour choisir une couleur consistante
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getResponsableColor(responsable)}`}>
      {responsable}
    </span>
  );
};

interface ActionPlanHierarchyProps {
  hierarchicalData: HierarchicalElement[];
  onElementClick?: (element: HierarchicalElement) => void;
  onEdit?: (element: HierarchicalElement) => void;
  onDelete?: (element: HierarchicalElement) => void;
}

const ActionPlanHierarchy: React.FC<ActionPlanHierarchyProps> = ({ 
  hierarchicalData, 
  onElementClick,
  onEdit,
  onDelete
}) => {
  // États pour la fonctionnalité du tableau
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [expandedJalons, setExpandedJalons] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: ''
  });
  
  // State local pour les statuts des tâches si onEdit n'est pas fourni
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  // Fonctions utilitaires
  const togglePhaseExpansion = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
      // Fermer aussi tous les jalons de cette phase
      const phaseJalons = hierarchicalData
        .filter(item => item.type === 'jalon' && item.parent_phase === phaseId)
        .map(jalon => jalon.element_id);
      phaseJalons.forEach(jalonId => expandedJalons.delete(jalonId));
      setExpandedJalons(new Set(expandedJalons));
    } else {
      newExpanded.add(phaseId);
      // Ouvrir aussi tous les jalons de cette phase
      const phaseJalons = hierarchicalData
        .filter(item => item.type === 'jalon' && item.parent_phase === phaseId)
        .map(jalon => jalon.element_id);
      const newExpandedJalons = new Set(expandedJalons);
      phaseJalons.forEach(jalonId => newExpandedJalons.add(jalonId));
      setExpandedJalons(newExpandedJalons);
    }
    setExpandedPhases(newExpanded);
  };

  const toggleJalonExpansion = (jalonId: string) => {
    const newExpanded = new Set(expandedJalons);
    if (newExpanded.has(jalonId)) {
      newExpanded.delete(jalonId);
    } else {
      newExpanded.add(jalonId);
    }
    setExpandedJalons(newExpanded);
  };

  const changeTaskStatus = (taskId: string, newStatus: 'À faire' | 'En cours' | 'Terminé') => {
    // Cette fonction sera appelée pour changer le statut d'une tâche
    if (onEdit) {
      // Si une fonction onEdit est fournie, l'utiliser (elle gère la sauvegarde Supabase)
      const task = hierarchicalData.find(item => item.element_id === taskId);
      if (task) {
        onEdit({ ...task, statut: newStatus });
      }
    } else {
      // Sinon, utiliser le state local pour les changements de statut
      setLocalStatuses(prev => ({
        ...prev,
        [taskId]: newStatus
      }));
    }
  };

  // Fonction helper pour obtenir le statut actuel d'une tâche
  const getTaskStatus = (task: HierarchicalElement) => {
    return localStatuses[task.element_id] || task.statut;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return '';
    if (min && max && min !== max) {
      return `${min.toLocaleString()}€ - ${max.toLocaleString()}€`;
    }
    if (min || max) {
      return `${(min || max)?.toLocaleString()}€`;
    }
    return '';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'phase': return 'Phase';
      case 'jalon': return 'Jalon';
      case 'tache': return 'Tâche';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phase': return <FolderOpen className="h-5 w-5" />;
      case 'jalon': return <Flag className="h-5 w-5" />;
      case 'tache': return <CircleCheck className="h-5 w-5" />;
      default: return null;
    }
  };

  // Organiser les données par phase pour un affichage séparé
  const dataByPhase = useMemo(() => {
    const phases = hierarchicalData.filter(item => item.type === 'phase');
    const jalons = hierarchicalData.filter(item => item.type === 'jalon');
    const taches = hierarchicalData.filter(item => item.type === 'tache');

    return phases.map(phase => {
      // Filtrer selon les critères de recherche et filtres
      const matchesPhaseSearch = phase.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (phase.objectif_principal && phase.objectif_principal.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesPhaseStatus = !filters.status || phase.statut === filters.status;
      const matchesPhaseType = !filters.type || filters.type === 'phase';

      const phaseJalons = jalons.filter(jalon => jalon.parent_phase === phase.element_id);
      const phaseTaches = taches.filter(tache => tache.parent_phase === phase.element_id);

      // Filtrer jalons et tâches
      const filteredJalons = phaseJalons.filter(jalon => {
        const matchesSearch = jalon.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (jalon.objectif_principal && jalon.objectif_principal.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = !filters.status || jalon.statut === filters.status;
        const matchesType = !filters.type || filters.type === 'jalon';
        return matchesSearch && matchesStatus && matchesType;
      });

      const filteredTaches = phaseTaches.filter(tache => {
        const matchesSearch = tache.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (tache.objectif_principal && tache.objectif_principal.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = !filters.status || tache.statut === filters.status;
        const matchesType = !filters.type || filters.type === 'tache';
        return matchesSearch && matchesStatus && matchesType;
      });

      const shouldShowPhase = matchesPhaseSearch && matchesPhaseStatus && matchesPhaseType;
      const hasVisibleChildren = filteredJalons.length > 0 || filteredTaches.length > 0;

      return {
        phase,
        jalons: filteredJalons,
        taches: filteredTaches,
        isVisible: shouldShowPhase || hasVisibleChildren,
        isExpanded: expandedPhases.has(phase.element_id)
      };
    }).filter(phaseData => phaseData.isVisible);
  }, [hierarchicalData, searchTerm, filters, expandedPhases]);

  // Statistiques
  const stats = {
    total: hierarchicalData.length,
    phases: hierarchicalData.filter(e => e.type === 'phase').length,
    jalons: hierarchicalData.filter(e => e.type === 'jalon').length,
    taches: hierarchicalData.filter(e => e.type === 'tache').length,
    aFaire: hierarchicalData.filter(e => e.type === 'tache' && e.statut === 'À faire').length,
    enCours: hierarchicalData.filter(e => e.type === 'tache' && e.statut === 'En cours').length,
    termine: hierarchicalData.filter(e => e.type === 'tache' && e.statut === 'Terminé').length,
  };

  if (!hierarchicalData || hierarchicalData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers3 className="h-5 w-5" />
            Plan d'action hiérarchique
          </CardTitle>
          <CardDescription>Structure détaillée des phases, jalons et tâches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Layers3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Aucune donnée hiérarchique disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ajout des styles CSS pour l'alignement parfait */}
      <style>{columnStyles}</style>
      
      {/* Header unifié avec recherche et statistiques */}
      <div className="bg-white rounded-lg border border-gray-200 px-6 py-4">
        <div className="flex flex-col gap-4">
          {/* Titre et contrôles */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Plan d'action hiérarchique</h3>
              <p className="text-sm text-gray-500 mt-1">Gérez vos phases, jalons et tâches</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Recherche */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>

              {/* Filtres */}
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="À faire">À faire</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
              </select>

              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="phase">Phases</option>
                <option value="jalon">Jalons</option>
                <option value="tache">Tâches</option>
              </select>
            </div>
          </div>

          {/* Statistiques */}
          <div className="border-t border-gray-100 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">{stats.phases}</div>
                <div className="text-xs text-gray-500">Phases</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{stats.jalons}</div>
                <div className="text-xs text-gray-500">Jalons</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{stats.taches}</div>
                <div className="text-xs text-gray-500">Tâches</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">{stats.aFaire}</div>
                <div className="text-xs text-gray-500">À faire</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-600">{stats.enCours}</div>
                <div className="text-xs text-gray-500">En cours</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">{stats.termine}</div>
                <div className="text-xs text-gray-500">Terminé</div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Phases avec jalons séparés */}
      <div className="space-y-4">
        {dataByPhase.map((phaseData) => (
          <div key={phaseData.phase.id} className="space-y-3">
            {/* Header Phase - Design épuré avec bouton Ouvrir au survol */}
            <div className="bg-white border border-gray-200 rounded-lg group">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePhaseExpansion(phaseData.phase.element_id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <ChevronRight 
                        className={`w-4 h-4 text-gray-500 transform transition-transform ${
                          phaseData.isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    <FolderOpen className="h-4 w-4 text-blue-600" />
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-medium text-gray-900">{phaseData.phase.nom}</h3>
                      {/* Bouton Ouvrir juste à droite du titre */}
                      <button
                        onClick={() => onElementClick?.(phaseData.phase)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs border border-gray-300 bg-white text-black rounded hover:bg-gray-100"
                      >
                        Ouvrir
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Durée de la phase en étiquette */}
                    {phaseData.phase.duree && (
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                        <Clock className="h-3 w-3 mr-1" />
                        {phaseData.phase.duree}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Jalons de la phase */}
            {phaseData.isExpanded && (
              <div className="ml-6 space-y-3">
                {phaseData.jalons.map((jalon) => {
                  const jalonTaches = phaseData.taches.filter(tache => tache.parent_jalon === jalon.element_id);
                  const isJalonExpanded = expandedJalons.has(jalon.element_id);

                  return (
                    <div key={jalon.id} className="space-y-2">
                      {/* Header Jalon - Design épuré avec bouton Ouvrir au survol */}
                      <div className="bg-white border border-gray-200 rounded-lg group">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {jalonTaches.length > 0 && (
                                <button
                                  onClick={() => toggleJalonExpansion(jalon.element_id)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <ChevronRight 
                                    className={`w-3 h-3 text-gray-500 transform transition-transform ${
                                      isJalonExpanded ? 'rotate-90' : ''
                                    }`}
                                  />
                                </button>
                              )}
                              <Flag className="h-4 w-4 text-green-600" />
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium text-gray-900">{jalon.nom}</h4>
                                {/* Bouton Ouvrir juste à droite du titre */}
                                <button
                                  onClick={() => onElementClick?.(jalon)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs border border-gray-300 bg-white text-black rounded hover:bg-gray-100"
                                >
                                  Ouvrir
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tableau des tâches du jalon */}
                        {isJalonExpanded && jalonTaches.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="min-w-full table-fixed">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="table-column-tache px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tâche
                                  </th>
                                  <th className="table-column-statut px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                  </th>
                                  <th className="table-column-responsable px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Responsable
                                  </th>
                                  <th className="table-column-duree px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Durée
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-100">
                                {jalonTaches.map((tache) => (
                                  <tr key={tache.id} className="hover:bg-gray-50 transition-colors group/row">
                                    <td className="table-column-tache px-3 py-3">
                                      <div className="flex items-center justify-between min-h-6">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <CircleCheck className="h-3 w-3 text-amber-500 flex-shrink-0" />
                                          <span className="text-sm text-gray-900 truncate pr-2">{tache.nom}</span>
                                        </div>
                                        {/* Bouton Ouvrir avec espace réservé */}
                                        <button
                                          onClick={() => onElementClick?.(tache)}
                                          className="opacity-0 group-hover/row:opacity-100 transition-opacity px-2 py-1 text-xs border border-gray-300 bg-white text-black rounded hover:bg-gray-100 ml-2 flex-shrink-0"
                                        >
                                          Ouvrir
                                        </button>
                                      </div>
                                    </td>
                                    <td className="table-column-statut px-3 py-3">
                                      <StatusDropdown 
                                        currentStatus={getTaskStatus(tache)}
                                        taskId={tache.element_id}
                                        onStatusChange={changeTaskStatus}
                                      />
                                    </td>
                                    <td className="table-column-responsable px-3 py-3">
                                      <div className="flex flex-wrap gap-1 min-h-6 items-center">
                                        {tache.responsable && tache.responsable.trim() ? (
                                          tache.responsable.split(',').map((resp, index) => (
                                            <ResponsableTag key={index} responsable={resp.trim()} />
                                          ))
                                        ) : (
                                          <span className="text-gray-400 text-xs">Non assigné</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="table-column-duree px-3 py-3 text-center">
                                      {tache.duree && (
                                        <div className="flex items-center justify-center gap-1">
                                          <Clock className="h-3 w-3 text-gray-400" />
                                          <span className="text-xs text-gray-600">{tache.duree}</span>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Tâches directes de la phase (sans jalon parent) */}
                {phaseData.taches.filter(tache => !tache.parent_jalon).length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700">Tâches directes</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-fixed">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="table-column-tache px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tâche
                            </th>
                            <th className="table-column-statut px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Statut
                            </th>
                            <th className="table-column-responsable px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Responsable
                            </th>
                            <th className="table-column-duree px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Durée
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {phaseData.taches.filter(tache => !tache.parent_jalon).map((tache) => (
                            <tr key={tache.id} className="hover:bg-gray-50 transition-colors group/row">
                              <td className="table-column-tache px-3 py-3">
                                <div className="flex items-center justify-between min-h-6">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <CircleCheck className="h-3 w-3 text-amber-500 flex-shrink-0" />
                                    <span className="text-sm text-gray-900 truncate pr-2">{tache.nom}</span>
                                  </div>
                                  {/* Bouton Ouvrir avec espace réservé */}
                                  <button
                                    onClick={() => onElementClick?.(tache)}
                                    className="opacity-0 group-hover/row:opacity-100 transition-opacity px-2 py-1 text-xs border border-gray-300 bg-white text-black rounded hover:bg-gray-100 ml-2 flex-shrink-0"
                                  >
                                    Ouvrir
                                  </button>
                                </div>
                              </td>
                              <td className="table-column-statut px-3 py-3">
                                <StatusDropdown 
                                  currentStatus={getTaskStatus(tache)}
                                  taskId={tache.element_id}
                                  onStatusChange={changeTaskStatus}
                                />
                              </td>
                              <td className="table-column-responsable px-3 py-3">
                                <div className="flex flex-wrap gap-1 min-h-6 items-center">
                                  {tache.responsable && tache.responsable.trim() ? (
                                    tache.responsable.split(',').map((resp, index) => (
                                      <ResponsableTag key={index} responsable={resp.trim()} />
                                    ))
                                  ) : (
                                    <span className="text-gray-400 text-xs">Non assigné</span>
                                  )}
                                </div>
                              </td>
                              <td className="table-column-duree px-3 py-3 text-center">
                                {tache.duree && (
                                  <div className="flex items-center justify-center gap-1">
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-600">{tache.duree}</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {dataByPhase.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
            <Layers3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Aucun élément ne correspond aux filtres appliqués</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ActionPlanHierarchy;
