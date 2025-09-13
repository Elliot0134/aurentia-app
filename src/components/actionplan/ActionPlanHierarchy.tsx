import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HierarchicalElement } from '@/hooks/useActionPlanData';
import ActionPlanStatusBadge from './ActionPlanStatusBadge';
import { 
  ChevronDown, 
  ChevronRight, 
  Layers3, 
  Target, 
  CheckSquare, 
  User, 
  Clock, 
  DollarSign,
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Couleurs pastel pour les responsables
const pastelColors = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-yellow-100 text-yellow-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
];

interface ActionPlanHierarchyProps {
  hierarchicalData: HierarchicalElement[];
  onElementClick?: (element: HierarchicalElement) => void;
  onStatusChange?: (elementId: string, newStatus: string) => void; // Nouvelle prop pour la mise à jour du statut
}

const ActionPlanHierarchy: React.FC<ActionPlanHierarchyProps> = ({ 
  hierarchicalData, 
  onElementClick,
  onStatusChange
}) => {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Calculer les couleurs des responsables une seule fois
  const responsibleColors = React.useMemo(() => {
    const colorsMap = new Map<string, string>();
    let colorIndex = 0;
    const allResponsibles = new Set<string>();

    hierarchicalData.forEach(element => {
      if (element.responsable) {
        element.responsable.split(',').forEach(resp => {
          const trimmedResp = resp.trim();
          if (trimmedResp && !colorsMap.has(trimmedResp)) {
            colorsMap.set(trimmedResp, pastelColors[colorIndex % pastelColors.length]);
            colorIndex++;
          }
        });
      }
    });
    return colorsMap;
  }, [hierarchicalData]); // Recalculer si les données hiérarchiques changent

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

  const togglePhaseExpansion = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phase': return <Layers3 className="h-4 w-4" />;
      case 'jalon': return <Target className="h-4 w-4" />;
      case 'tache': return <CheckSquare className="h-4 w-4" />;
      default: return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'phase': return 'Phase';
      case 'jalon': return 'Jalon';
      case 'tache': return 'Tâche';
      default: return type;
    }
  };

  const getRowClasses = (element: HierarchicalElement) => {
    let baseClasses = "transition-colors hover:bg-muted/30 cursor-pointer ";
    
    switch (element.level) {
      case 0: // Phases
        return baseClasses + "bg-white font-bold border-b-4 border-gray-50";
      case 1: // Jalons
        return baseClasses + "bg-gray-50 font-semibold";
      case 2: // Tâches
        return baseClasses + "bg-white font-normal";
      default:
        return baseClasses + "bg-white";
    }
  };

  const getIndentationStyle = (level: number) => {
    const padding = level * 20;
    return { paddingLeft: `${padding}px` };
  };

  // Filtrage des données
  const filteredData = hierarchicalData.filter(element => {
    // Recherche textuelle
    const matchesSearch = !searchTerm || 
      element.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      element.objectif_principal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      element.responsable?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre par statut
    const matchesStatus = statusFilter === 'all' || element.statut === statusFilter;

    // Filtre par priorité
    const matchesPriority = priorityFilter === 'all' || element.criticite === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Logique d'affichage hiérarchique avec expand/collapse
  const getVisibleElements = () => {
    const visible: HierarchicalElement[] = [];
    
    for (const element of filteredData) {
      if (element.level === 0) {
        // Toujours afficher les phases
        visible.push(element);
      } else if (element.level === 1) {
        // Afficher les jalons seulement si la phase parente est étendue
        if (element.parent_phase && expandedPhases.has(element.parent_phase)) {
          visible.push(element);
        }
      } else if (element.level === 2) {
        // Afficher les tâches seulement si la phase parente est étendue
        if (element.parent_phase && expandedPhases.has(element.parent_phase)) {
          visible.push(element);
        }
      }
    }
    
    return visible;
  };

  const visibleElements = getVisibleElements();

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 mb-4">
          Plan d'action hiérarchique
        </CardTitle>
        
        {/* Statistiques en haut */}
        <div className="border-b bg-gray-50 p-4 mb-4 rounded-t-lg">
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
        
        {/* Filtres */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher dans le plan d'action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="À faire">À faire</SelectItem>
              <SelectItem value="En cours">En cours</SelectItem>
              <SelectItem value="Terminé">Terminé</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes priorités</SelectItem>
              <SelectItem value="Critique">Critique</SelectItem>
              <SelectItem value="Important">Important</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-1/3">Élément</TableHead>
                <TableHead className="w-32">Responsable</TableHead>
                <TableHead className="w-28">Durée</TableHead>
                <TableHead className="w-28">Priorité</TableHead>
                <TableHead className="w-24">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleElements.map((element) => (
                <TableRow
                  key={element.id}
                  className={getRowClasses(element)}
                  onClick={() => onElementClick?.(element)}
                >
                  <TableCell style={getIndentationStyle(element.level)}>
                    <div className="flex items-center gap-2">
                      {element.type === 'phase' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePhaseExpansion(element.element_id);
                          }}
                        >
                          {expandedPhases.has(element.element_id) ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </Button>
                      )}
                      
                      {getTypeIcon(element.type)}
                      
                      <div className="min-w-0 flex-1">
                        <div className={`truncate ${element.type === 'phase' ? 'text-lg font-semibold font-biz-ud-mincho' : element.type === 'jalon' ? 'font-medium text-base' : 'font-medium text-sm'}`}>
                          {element.nom}
                        </div>
                        {element.type === 'phase' && (element.budget_minimum || element.budget_optimal) && (
                          <div className="text-xs text-gray-500 truncate mt-1 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>Budget: {formatBudget(element.budget_minimum, element.budget_optimal)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {element.responsable && (
                      <div className="flex flex-wrap gap-1">
                        {element.responsable.split(',').map((resp, index) => {
                          const responsibleName = resp.trim();
                          const colorClass = responsibleColors.get(responsibleName);
                          return (
                            <Badge key={index} className={`text-xs ${colorClass}`}>
                              {responsibleName}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {element.duree && (
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="truncate">{element.duree}</span>
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {element.criticite && (
                      <ActionPlanStatusBadge type="priority" value={element.criticite} />
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {element.type === 'tache' && (
                      <ActionPlanStatusBadge 
                        type="status" 
                        value={element.statut} 
                        elementId={element.element_id}
                        onStatusChange={onStatusChange}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {visibleElements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Aucun élément ne correspond aux filtres appliqués</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActionPlanHierarchy;
