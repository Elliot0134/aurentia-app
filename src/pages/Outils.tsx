import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CardHeader } from '@/components/ui/card';
import { Credit3DDisplay } from '@/components/ui/Credit3DDisplay';
import { Search, SlidersHorizontal, ChevronDown, Star, Zap, TrendingUp, Users, Settings, Code, Image, Video, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAIToolsList } from '@/hooks/useAIToolsNew';
import type { AITool } from '@/types/aiTools';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Outils: React.FC = () => {
  const navigate = useNavigate();
  const { tools, loading, favorites, toggleFavorite } = useAIToolsList();

  // Get filters from URL params (source of truth)
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const validCategories = ['all', 'text', 'image', 'video', 'audio', 'code', 'data', 'business', 'education'];
  const categoryFromUrl = searchParams.get('category') || 'all';
  const selectedCategory = validCategories.includes(categoryFromUrl) ? categoryFromUrl : 'all';
  const validSorts = ['popularity', 'name', 'date', 'category'];
  const sortFromUrl = searchParams.get('sort') || 'popularity';
  const sortBy = validSorts.includes(sortFromUrl) ? sortFromUrl : 'popularity';
  const favoritesOnly = searchParams.get('favorites') === 'true';

  // Functions to update URL params
  const updateUrlParams = (updates: Record<string, string | boolean>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      const stringValue = String(value);
      if (value && value !== 'all' && value !== 'false' && value !== 'popularity' && value !== '') {
        newParams.set(key, stringValue);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const setSearchTerm = (search: string) => updateUrlParams({ search });
  const setSelectedCategory = (category: string) => updateUrlParams({ category });
  const setSortBy = (sort: string) => updateUrlParams({ sort });
  const setFavoritesOnly = (favorites: boolean) => updateUrlParams({ favorites });

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: ''
  });

  // Filtrer les outils
  const filteredTools = tools.filter(tool => {
    const matchesSearch = (tool.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tool.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesFavorites = !favoritesOnly || favorites.includes(tool.id);
    
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  // Trier les outils
  const sortedTools = [...filteredTools].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.title || '').localeCompare(b.title || '');
      case 'popularity':
        return (b.credits_cost || 0) - (a.credits_cost || 0); // Utilise credits_cost comme proxy pour la popularité
      case 'category':
        return (a.category || '').localeCompare(b.category || '');
      case 'date':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      default:
        return 0;
    }
  });

  const handleToolClick = (tool: AITool) => {
    navigate(`/individual/outils/${tool.slug}/${tool.id}`);
  };

  const handleSubmitRequest = () => {
    toast.success('Demande soumise avec succès!');
    setDialogOpen(false);
    setFormData({ type: '', title: '', description: '' });
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'text': <Zap className="h-5 w-5" />,
      'image': <Image className="h-5 w-5" />,
      'video': <Video className="h-5 w-5" />,
      'audio': <Volume2 className="h-5 w-5" />,
      'code': <Code className="h-5 w-5" />,
      'data': <TrendingUp className="h-5 w-5" />,
      'business': <Users className="h-5 w-5" />,
      'education': <Settings className="h-5 w-5" />
    };
    return icons[category] || <Zap className="h-5 w-5" />;
  };

  const statsData = [
    {
      title: 'Outils disponibles',
      value: tools.length.toString(),
      icon: <Zap className="h-6 w-6" />
    },
    {
      title: 'Mes favoris',
      value: favorites.length.toString(),
      icon: <Star className="h-6 w-6" />
    },
    {
      title: 'Coût moyen',
      value: tools.length > 0 ? Math.round(tools.reduce((sum, tool) => sum + tool.credits_cost, 0) / tools.length).toString() + ' crédits' : '0',
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      title: 'Catégories',
      value: [...new Set(tools.map(tool => tool.category))].length.toString(),
      icon: <Users className="h-6 w-6" />
    }
  ];

  if (loading) {
    return <LoadingSpinner message="Chargement..." fullScreen />;
  }

  return (
    <div className="min-h-screen" style={{ background: '#F4F4F1' }}>
  <div className="mx-auto px-4 py-8" style={{ width: '85%', maxWidth: '1400px' }}>
        {/* En-tête avec boutons d'action */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Outils IA</h1>
              <p className="text-gray-600">
                Découvrez et utilisez une collection complète d'outils d'intelligence artificielle
                pour booster votre productivité et automatiser vos tâches.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" className="bg-white border border-gray-200 hover:bg-gray-50">
                En savoir +
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                    Ajouter +
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nouvelle demande d'outil</DialogTitle>
                    <DialogDescription>
                      Proposez un nouvel outil IA que vous aimeriez voir intégré à notre plateforme.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Type d'outil</label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Outil de texte</SelectItem>
                          <SelectItem value="image">Outil d'image</SelectItem>
                          <SelectItem value="video">Outil vidéo</SelectItem>
                          <SelectItem value="audio">Outil audio</SelectItem>
                          <SelectItem value="code">Outil de code</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nom de l'outil</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Ex: GPT-4 Writer Pro"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description et utilité</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Décrivez l'outil et pourquoi il serait utile..."
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSubmitRequest} style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
                      Soumettre la demande
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat, index) => (
            <Card key={index} className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#fef2ed', color: '#ff5932' }}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Conteneur de filtres avec accordéon */}
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
              <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${filtersOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
          
          <div className={cn(
            "transition-all duration-300 overflow-hidden",
            filtersOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}>
            <CardContent className="pt-0">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Barre de recherche */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher un outil..."
                    className="pl-10 w-full focus:ring-0 focus:border-gray-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Bouton de tri */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[180px] focus:ring-0 focus:border-gray-300">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularité</SelectItem>
                    <SelectItem value="name">Nom A-Z</SelectItem>
                    <SelectItem value="date">Date d'ajout</SelectItem>
                    <SelectItem value="category">Catégorie</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Filtres supplémentaires */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[180px] focus:ring-0 focus:border-gray-300">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="text">Texte</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Vidéo</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="data">Données</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="education">Éducation</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Filtre favoris */}
                <Button
                  variant={favoritesOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFavoritesOnly(!favoritesOnly)}
                  className="flex items-center gap-2"
                >
                  <Star className={cn("h-4 w-4", favoritesOnly && "fill-current")} />
                  Favoris
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Grille de cartes d'outils */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTools.map((tool) => (
            <Card
              key={tool.id}
              className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 overflow-hidden border rounded-lg"
              onClick={() => handleToolClick(tool)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  {/* Image à gauche, sans background */}
                  <div className="flex-shrink-0 w-20 h-20 rounded-tl-lg rounded-bl-lg overflow-hidden flex items-center justify-center">
                    {tool.image_url ? (
                      <img 
                        src={tool.image_url} 
                        alt={tool.title}
                        className="w-full h-full object-cover"
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <div className="text-gray-400 text-2xl w-full h-full flex items-center justify-center">
                        {getCategoryIcon(tool.category)}
                      </div>
                    )}
                  </div>
                  {/* Titre et description à droite */}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold mb-2">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 line-clamp-2">
                      {tool.description}
                    </CardDescription>
                  </div>
                </div>
                {/* Tags en dessous du bloc titre+description */}
                <div className="flex flex-wrap gap-1 mt-3">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-normal">
                    {tool.category}
                  </span>
                  {tool.tags && tool.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-normal"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {/* Informations de bas de carte */}
                <div className="flex items-center justify-between mt-4">
                  {/* Affichage du coût en crédits avec image 3D */}
                  <div className="flex items-center gap-1 text-sm">
                    <img src="/credit-3D.png" alt="Crédit" className="w-5 h-5" style={{ display: 'inline-block' }} />
                    <span className="font-semibold text-gray-700">{tool.credits_cost}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1.5 h-8 w-8 transition-opacity rounded-full hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(tool.id);
                      }}
                    >
                      <Star className={cn("h-4 w-4", favorites.includes(tool.id) && "fill-yellow-400 text-yellow-400")} />
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs px-3 py-1.5 h-auto text-white"
                      style={{ backgroundColor: '#ff5932' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToolClick(tool);
                      }}
                    >
                      Utiliser
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Message si aucun outil trouvé */}
        {sortedTools.length === 0 && (
          <Card className="border">
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun outil trouvé
              </h3>
              <p className="text-gray-600">
                Essayez de modifier vos critères de recherche ou de filtres.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Outils;