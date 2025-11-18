import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, ChevronDown, Plus, Filter, Grid3x3, List, FileText, Files, Send, Star, CheckSquare, Square, Trash2, Archive, FileCheck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useOrganizationResources } from '@/hooks/useOrganizationResources';
import { useOrganisationData } from '@/hooks/useOrganisationData';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SendResourceDialog } from '@/components/resource-viewer/SendResourceDialog';
import { cn } from '@/lib/utils';
import type { OrganizationResource } from '@/services/resourcesService';
import { useOrgPageTitle } from '@/hooks/usePageTitle';

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255, 89, 44';
};

const OrganisationRessources = () => {
  useOrgPageTitle("Ressources");
  const { id: organisationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resources, loading, error, refetch, duplicateResource, toggleFavorite, editResource, removeResource } = useOrganizationResources(organisationId);
  const { organisation } = useOrganisationData();

  // Get all filters from URL params (source of truth)
  const [searchParams, setSearchParams] = useSearchParams();

  const searchTerm = searchParams.get('search') || '';
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const selectedType = searchParams.get('type') || 'all';
  const selectedVisibility = searchParams.get('visibility') || 'all';
  const selectedStatus = searchParams.get('status') || 'all';
  const selectedAuthor = searchParams.get('author') || 'all';
  const dateRangeFilter = searchParams.get('dateRange') || 'all';
  const sortBy = searchParams.get('sort') || 'date';
  const viewMode = (searchParams.get('view') === 'list' ? 'list' : 'grid') as 'grid' | 'list';
  const showFavoritesOnly = searchParams.get('favorites') === 'true';

  // Functions to update filters and URL (preserving other params)
  const updateUrlParams = useCallback((updates: Record<string, string | boolean>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      const stringValue = String(value);
      if (value && value !== 'all' && value !== 'false') {
        newParams.set(key, stringValue);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const setSearchTerm = useCallback((search: string) => updateUrlParams({ search }), [updateUrlParams]);
  const setSelectedType = useCallback((type: string) => updateUrlParams({ type }), [updateUrlParams]);
  const setSelectedVisibility = useCallback((visibility: string) => updateUrlParams({ visibility }), [updateUrlParams]);
  const setSelectedStatus = useCallback((status: string) => updateUrlParams({ status }), [updateUrlParams]);
  const setSelectedAuthor = useCallback((author: string) => updateUrlParams({ author }), [updateUrlParams]);
  const setDateRangeFilter = useCallback((dateRange: string) => updateUrlParams({ dateRange }), [updateUrlParams]);
  const setSortBy = useCallback((sort: string) => updateUrlParams({ sort }), [updateUrlParams]);
  const setViewMode = useCallback((view: 'grid' | 'list') => updateUrlParams({ view }), [updateUrlParams]);
  const setShowFavoritesOnly = useCallback((favorites: boolean) => updateUrlParams({ favorites }), [updateUrlParams]);

  const [filtersOpen, setFiltersOpen] = useState(false);

  // Bulk operations state
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());

  // Send resource dialog state
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [resourcesToSend, setResourcesToSend] = useState<OrganizationResource[]>([]);

  // White-label support - detect organization colors
  const whiteLabelEnabled = organisation?.settings?.branding?.whiteLabel ?? false;
  const orgPrimaryColor = organisation?.settings?.branding?.primaryColor || organisation?.primary_color || '#ff5932';

  // Create CSS variables for white-label support
  const pageStyles = useMemo(() => {
    if (whiteLabelEnabled && organisation) {
      return {
        '--org-primary-color': orgPrimaryColor,
        '--color-primary': orgPrimaryColor,
        '--org-primary-rgb': hexToRgb(orgPrimaryColor),
      } as React.CSSProperties;
    }
    return {};
  }, [whiteLabelEnabled, organisation, orgPrimaryColor]);

  // Debounce search term (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Calculate stats from resources
  const stats = useMemo(() => {
    const total = resources.length;
    const completed = resources.filter(r => r.status === 'published').length;
    const inProgress = resources.filter(r => r.status === 'draft').length;
    const byType: Record<string, number> = {};

    resources.forEach(r => {
      const type = r.resource_type || 'guide';
      byType[type] = (byType[type] || 0) + 1;
    });

    return { total, completed, inProgress, byType };
  }, [resources]);

  // Get unique authors for filter
  const uniqueAuthors = useMemo(() => {
    const authors = new Map<string, string>();
    resources.forEach(r => {
      if (r.created_by && r.author_name) {
        authors.set(r.created_by, r.author_name);
      }
    });
    return Array.from(authors.entries()).map(([id, name]) => ({ id, name }));
  }, [resources]);

  // Helper function for date filtering
  const isWithinDateRange = (dateStr: string | undefined, range: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();

    switch (range) {
      case 'today':
        return date.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return date >= monthAgo;
      case 'quarter':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return date >= quarterAgo;
      default:
        return true;
    }
  };

  // Filter resources (using debounced search term for better performance)
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = (resource.title || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           (resource.description || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || resource.resource_type === selectedType;
      const matchesVisibility = selectedVisibility === 'all' || resource.visibility === selectedVisibility;
      const matchesStatus = selectedStatus === 'all' || resource.status === selectedStatus;
      const matchesAuthor = selectedAuthor === 'all' || resource.created_by === selectedAuthor;
      const matchesDateRange = dateRangeFilter === 'all' || isWithinDateRange(resource.created_at, dateRangeFilter);
      const matchesFavorites = !showFavoritesOnly || resource.is_favorited === true;

      return matchesSearch && matchesType && matchesVisibility && matchesStatus && matchesAuthor && matchesDateRange && matchesFavorites;
    });
  }, [resources, debouncedSearchTerm, selectedType, selectedVisibility, selectedStatus, selectedAuthor, dateRangeFilter, showFavoritesOnly]);

  // Sort resources
  const sortedResources = useMemo(() => {
    return [...filteredResources].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        case 'date':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'type':
          return (a.resource_type || '').localeCompare(b.resource_type || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });
  }, [filteredResources, sortBy]);

  const handleResourceClick = useCallback((resource: OrganizationResource) => {
    navigate(`/organisation/${organisationId}/ressources/${resource.id}`);
  }, [navigate, organisationId]);

  const handleCreateResource = useCallback(() => {
    navigate(`/organisation/${organisationId}/ressources/create`);
  }, [navigate, organisationId]);

  const handleDuplicateResource = useCallback(async (e: React.MouseEvent, resource: OrganizationResource) => {
    e.stopPropagation(); // Prevent card click
    const duplicate = await duplicateResource(resource.id);
    if (duplicate) {
      toast({
        title: "Succès",
        description: `"${resource.title}" a été dupliqué avec succès.`,
      });
    }
  }, [duplicateResource, toast]);

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent, resource: OrganizationResource) => {
    e.stopPropagation(); // Prevent card click
    const isFavorited = await toggleFavorite(resource.id);
    toast({
      title: isFavorited ? "Ajouté aux favoris" : "Retiré des favoris",
      description: isFavorited
        ? `"${resource.title}" a été ajouté à vos favoris.`
        : `"${resource.title}" a été retiré de vos favoris.`,
    });
  }, [toggleFavorite, toast]);

  const handleSendResource = useCallback((e: React.MouseEvent, resource: OrganizationResource) => {
    e.stopPropagation(); // Prevent card click
    setResourcesToSend([resource]);
    setSendDialogOpen(true);
  }, []);

  const handleBulkSend = useCallback(() => {
    const count = selectedResources.size;
    if (count === 0) return;

    const resourcesToSendArray = sortedResources.filter(r => selectedResources.has(r.id));
    setResourcesToSend(resourcesToSendArray);
    setSendDialogOpen(true);
  }, [selectedResources, sortedResources]);

  const handleSendSuccess = useCallback(() => {
    // Optionally clear selection after sending
    if (bulkMode && selectedResources.size > 0) {
      setSelectedResources(new Set());
      setBulkMode(false);
    }
  }, [bulkMode, selectedResources.size]);

  // Bulk operations handlers
  const toggleBulkMode = useCallback(() => {
    setBulkMode(prev => !prev);
    setSelectedResources(new Set());
  }, []);

  const toggleResourceSelection = useCallback((resourceId: string) => {
    setSelectedResources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });
  }, []);

  const selectAllResources = useCallback(() => {
    if (selectedResources.size === sortedResources.length) {
      setSelectedResources(new Set());
    } else {
      setSelectedResources(new Set(sortedResources.map(r => r.id)));
    }
  }, [selectedResources.size, sortedResources]);

  const handleBulkPublish = useCallback(async () => {
    const count = selectedResources.size;
    if (count === 0) return;

    if (!confirm(`Publier ${count} ressource(s) ?`)) return;

    let successCount = 0;
    for (const id of selectedResources) {
      const result = await editResource(id, { status: 'published' });
      if (result) successCount++;
    }

    toast({
      title: "Publication réussie",
      description: `${successCount} ressource(s) publiée(s)`,
    });
    setSelectedResources(new Set());
    setBulkMode(false);
  }, [selectedResources, editResource, toast]);

  const handleBulkArchive = useCallback(async () => {
    const count = selectedResources.size;
    if (count === 0) return;

    if (!confirm(`Archiver ${count} ressource(s) ?`)) return;

    let successCount = 0;
    for (const id of selectedResources) {
      const result = await editResource(id, { status: 'archived' });
      if (result) successCount++;
    }

    toast({
      title: "Archivage réussi",
      description: `${successCount} ressource(s) archivée(s)`,
    });
    setSelectedResources(new Set());
    setBulkMode(false);
  }, [selectedResources, editResource, toast]);

  const handleBulkDelete = useCallback(async () => {
    const count = selectedResources.size;
    if (count === 0) return;

    if (!confirm(`⚠️ ATTENTION: Supprimer définitivement ${count} ressource(s) ? Cette action est irréversible.`)) return;

    let successCount = 0;
    for (const id of selectedResources) {
      const result = await removeResource(id);
      if (result) successCount++;
    }

    toast({
      title: "Suppression réussie",
      description: `${successCount} ressource(s) supprimée(s)`,
    });
    setSelectedResources(new Set());
    setBulkMode(false);
  }, [selectedResources, removeResource, toast]);

  const getResourceTypeColor = (type?: string) => {
    const colors: Record<string, string> = {
      'guide': 'bg-blue-100 text-blue-700',
      'template': 'bg-purple-100 text-purple-700',
      'document': 'bg-green-100 text-green-700',
      'custom': 'bg-orange-100 text-orange-700'
    };
    return colors[type || 'guide'] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      'draft': { label: 'Brouillon', className: 'bg-yellow-100 text-yellow-700' },
      'published': { label: 'Publié', className: 'bg-green-100 text-green-700' },
      'archived': { label: 'Archivé', className: 'bg-gray-100 text-gray-700' }
    };
    return statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
  };

  if (loading) {
    return <LoadingSpinner message="Chargement..." fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ background: '#F4F4F1' }}>
        <div className="mx-auto px-4 py-8" style={{ width: '85%', maxWidth: '1400px' }}>
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-red-600 mb-4 text-4xl">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={refetch} className="btn-white-label hover:opacity-90">
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#F4F4F1', ...pageStyles }}>
      <div className="mx-auto px-4 py-8" style={{ width: '85%', maxWidth: '1400px' }}>
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Centre de Ressources</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Créez et gérez des ressources personnalisées pour votre organisation et vos adhérents.
              </p>
            </div>
            <Button
              className="btn-white-label hover:opacity-90 text-white w-full sm:w-auto whitespace-nowrap"
              onClick={handleCreateResource}
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total des ressources</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: whiteLabelEnabled ? `rgba(${hexToRgb(orgPrimaryColor)}, 0.1)` : '#fef2ed',
                    color: orgPrimaryColor
                  }}
                >
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Publiées</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Filter className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Brouillons</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
                <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                  <SlidersHorizontal className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Types différents</p>
                  <p className="text-2xl font-bold">{Object.keys(stats.byType).length}</p>
                </div>
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <Grid3x3 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 border">
          <CardHeader className="pb-4">
            <div
              className="cursor-pointer flex items-center justify-between"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg">Filtres et Recherche</CardTitle>
              </div>
              <ChevronDown className={cn(
                "h-5 w-5 text-gray-600 transition-transform duration-300",
                filtersOpen && "rotate-180"
              )} />
            </div>
          </CardHeader>

          <div className={cn(
            "transition-all duration-300 overflow-hidden",
            filtersOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          )}>
            <CardContent className="pt-0">
              {/* Search - Full width on all devices */}
              <div className="relative w-full mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher une ressource..."
                  className="pl-10 w-full focus:ring-0 focus:border-gray-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filters Grid - Responsive layout */}
              <div className="space-y-3">
                {/* Row 1: Main filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full focus:ring-0 focus:border-gray-300">
                      <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date de création</SelectItem>
                      <SelectItem value="name">Nom A-Z</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                      <SelectItem value="status">Statut</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Type Filter */}
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-full focus:ring-0 focus:border-gray-300">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="template">Modèle</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="custom">Personnalisé</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full focus:ring-0 focus:border-gray-300">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center justify-center gap-1 bg-white border rounded-md p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-8 flex-1 sm:w-auto"
                    >
                      <Grid3x3 className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Grille</span>
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 flex-1 sm:w-auto"
                    >
                      <List className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Liste</span>
                    </Button>
                  </div>
                </div>

                {/* Row 2: Advanced filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Author Filter */}
                  <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                    <SelectTrigger className="w-full focus:ring-0 focus:border-gray-300">
                      <SelectValue placeholder="Auteur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les auteurs</SelectItem>
                      {uniqueAuthors.map(author => (
                        <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Date Range Filter */}
                  <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                    <SelectTrigger className="w-full focus:ring-0 focus:border-gray-300">
                      <SelectValue placeholder="Période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les périodes</SelectItem>
                      <SelectItem value="today">Aujourd'hui</SelectItem>
                      <SelectItem value="week">Cette semaine</SelectItem>
                      <SelectItem value="month">Ce mois-ci</SelectItem>
                      <SelectItem value="quarter">Ce trimestre</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Visibility Filter */}
                  <Select value={selectedVisibility} onValueChange={setSelectedVisibility}>
                    <SelectTrigger className="w-full focus:ring-0 focus:border-gray-300">
                      <SelectValue placeholder="Visibilité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les visibilités</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Privé (Staff)</SelectItem>
                      <SelectItem value="personal">Personnel</SelectItem>
                      <SelectItem value="custom">Personnalisé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 3: Favorites Filter */}
                <div className="flex items-center gap-2 pt-3 border-t">
                  <Checkbox
                    id="favorites-filter"
                    checked={showFavoritesOnly}
                    onCheckedChange={setShowFavoritesOnly}
                  />
                  <label
                    htmlFor="favorites-filter"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    Afficher uniquement les favoris
                  </label>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Bulk Mode Toggle Button */}
        <div className="mb-6">
          <Button
            variant={bulkMode ? "default" : "outline"}
            size="sm"
            className={cn(
              "transition-all",
              bulkMode && "bg-blue-600 hover:bg-blue-700 text-white"
            )}
            onClick={toggleBulkMode}
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            {bulkMode ? `Mode sélection actif (${selectedResources.size})` : 'Activer le mode sélection'}
          </Button>
        </div>

        {/* Bulk Actions Bar - Relocated from header */}
        {bulkMode && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedResources.size === sortedResources.length && sortedResources.length > 0}
                  onCheckedChange={selectAllResources}
                />
                <span className="text-sm font-medium">
                  {selectedResources.size === 0
                    ? "Sélectionner tout"
                    : `${selectedResources.size} sélectionné(s)`}
                </span>
              </div>
              {selectedResources.size > 0 && (
                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                  <Button
                    size="sm"
                    className="flex-1 sm:flex-none btn-white-label hover:opacity-90 text-white"
                    onClick={handleBulkSend}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkPublish}
                    className="flex-1 sm:flex-none"
                  >
                    <FileCheck className="w-4 h-4 mr-2" />
                    Publier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkArchive}
                    className="flex-1 sm:flex-none"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archiver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkDelete}
                    className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resources Grid/List */}
        {sortedResources.length === 0 ? (
          <Card className="border">
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune ressource trouvée
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                  ? 'Essayez de modifier vos critères de recherche ou de filtres.'
                  : 'Commencez par créer votre première ressource.'}
              </p>
              <Button
                onClick={handleCreateResource}
                className="btn-white-label hover:opacity-90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer une ressource
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
          )}>
            {sortedResources.map((resource) => {
              const statusBadge = getStatusBadge(resource.status);

              return (
                <Card
                  key={resource.id}
                  className={cn(
                    "group transition-all duration-200 overflow-hidden border rounded-lg",
                    !bulkMode && "cursor-pointer hover:shadow-lg hover:-translate-y-1",
                    bulkMode && selectedResources.has(resource.id) && "ring-2 ring-blue-500 bg-blue-50"
                  )}
                  onClick={() => !bulkMode && handleResourceClick(resource)}
                >
                  <CardContent className={cn(
                    viewMode === 'grid' ? 'p-5' : 'p-4 flex items-center gap-4'
                  )}>
                    {/* Bulk Mode Checkbox */}
                    {bulkMode && (
                      <div className="flex items-start">
                        <Checkbox
                          checked={selectedResources.has(resource.id)}
                          onCheckedChange={() => toggleResourceSelection(resource.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                    {viewMode === 'grid' ? (
                      <>
                        {/* Grid View */}
                        <div className={cn("mb-3", bulkMode && "ml-3 flex-1")}>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold line-clamp-2 flex-1">
                              {resource.title}
                            </h3>
                            <button
                              onClick={(e) => handleToggleFavorite(e, resource)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title={resource.is_favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
                            >
                              <Star
                                className={cn(
                                  "w-4 h-4",
                                  resource.is_favorited ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                                )}
                              />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {resource.description || 'Aucune description'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className={cn(
                              'text-xs px-2 py-1 rounded-md font-medium',
                              getResourceTypeColor(resource.resource_type)
                            )}>
                              {resource.resource_type || 'guide'}
                            </span>
                            <span className={cn(
                              'text-xs px-2 py-1 rounded-md font-medium',
                              statusBadge.className
                            )}>
                              {statusBadge.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-xs text-gray-500">
                            {resource.created_at
                              ? new Date(resource.created_at).toLocaleDateString('fr-FR')
                              : 'N/A'}
                          </span>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 py-1.5 h-auto"
                              onClick={(e) => handleDuplicateResource(e, resource)}
                              title="Dupliquer"
                            >
                              <Files className="w-3 h-3 mr-1" />
                              Dupliquer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 py-1.5 h-auto"
                              onClick={(e) => handleSendResource(e, resource)}
                              title="Envoyer"
                            >
                              <Send className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              className="text-xs px-3 py-1.5 h-auto text-white btn-white-label hover:opacity-90"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResourceClick(resource);
                              }}
                            >
                              Ouvrir
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* List View */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <h3 className="text-lg font-semibold truncate flex-1">
                              {resource.title}
                            </h3>
                            <button
                              onClick={(e) => handleToggleFavorite(e, resource)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title={resource.is_favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
                            >
                              <Star
                                className={cn(
                                  "w-4 h-4",
                                  resource.is_favorited ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                                )}
                              />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                            {resource.description || 'Aucune description'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className={cn(
                              'text-xs px-2 py-1 rounded-md font-medium',
                              getResourceTypeColor(resource.resource_type)
                            )}>
                              {resource.resource_type || 'guide'}
                            </span>
                            <span className={cn(
                              'text-xs px-2 py-1 rounded-md font-medium',
                              statusBadge.className
                            )}>
                              {statusBadge.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            {resource.created_at
                              ? new Date(resource.created_at).toLocaleDateString('fr-FR')
                              : 'N/A'}
                          </span>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 py-2 h-auto"
                              onClick={(e) => handleDuplicateResource(e, resource)}
                              title="Dupliquer"
                            >
                              <Files className="w-3 h-3 mr-1" />
                              Dupliquer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 py-2 h-auto"
                              onClick={(e) => handleSendResource(e, resource)}
                              title="Envoyer"
                            >
                              <Send className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              className="text-xs px-4 py-2 h-auto text-white whitespace-nowrap btn-white-label hover:opacity-90"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResourceClick(resource);
                              }}
                            >
                              Ouvrir
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Send Resource Dialog */}
      <SendResourceDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        resources={resourcesToSend}
        onSuccess={handleSendSuccess}
      />
    </div>
  );
};

export default OrganisationRessources;
