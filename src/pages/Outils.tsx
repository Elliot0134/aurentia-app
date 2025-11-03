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
import { Search, SlidersHorizontal, Star, Zap, TrendingUp, Users, Settings, Code, Image, Video, Volume2, Check } from 'lucide-react';
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
    <div className="min-h-screen bg-[var(--bg-page)]">
      <div className="container-aurentia py-8">
        {/* En-tête avec boutons d'action */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 style={{ fontFamily: 'var(--h1-font)', fontSize: 'var(--h1-size)', fontWeight: 'var(--h1-weight)', color: 'var(--h1-color)' }}>Outils IA</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button className="bg-white border border-gray-200 text-[var(--text-primary)] px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                En savoir +
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary">
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
                    <Button className="btn-secondary" onClick={() => setDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSubmitRequest} className="btn-primary">
                      Soumettre la demande
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid-aurentia grid-cols-2 lg:grid-cols-4 mb-8">
          {statsData.map((stat, index) => (
            <Card key={index} className="card-static">
              <CardContent className="px-4 py-2">
                <p className="text-sm text-[var(--text-muted)]">{stat.title}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtres et Recherche */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="h-5 w-5 text-[var(--text-muted)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Filtres et Recherche</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Barre de recherche */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] h-4 w-4 pointer-events-none" />
              <Input
                placeholder="Rechercher un outil..."
                className="bg-white border border-[var(--border-default)] rounded-lg w-full pl-10 pr-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-default)] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Bouton de tri */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px] bg-white border border-[var(--border-default)] rounded-lg transition-all duration-200 focus:outline-none focus:border-gray-400 focus:ring-0">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="popularity" className="hover:bg-gray-50 cursor-pointer">Popularité</SelectItem>
                <SelectItem value="name" className="hover:bg-gray-50 cursor-pointer">Nom A-Z</SelectItem>
                <SelectItem value="date" className="hover:bg-gray-50 cursor-pointer">Date d'ajout</SelectItem>
                <SelectItem value="category" className="hover:bg-gray-50 cursor-pointer">Catégorie</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtres supplémentaires */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px] bg-white border border-[var(--border-default)] rounded-lg transition-all duration-200 focus:outline-none focus:border-gray-400 focus:ring-0">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all" className="hover:bg-gray-50 cursor-pointer">Toutes les catégories</SelectItem>
                <SelectItem value="text" className="hover:bg-gray-50 cursor-pointer">Texte</SelectItem>
                <SelectItem value="image" className="hover:bg-gray-50 cursor-pointer">Image</SelectItem>
                <SelectItem value="video" className="hover:bg-gray-50 cursor-pointer">Vidéo</SelectItem>
                <SelectItem value="audio" className="hover:bg-gray-50 cursor-pointer">Audio</SelectItem>
                <SelectItem value="code" className="hover:bg-gray-50 cursor-pointer">Code</SelectItem>
                <SelectItem value="data" className="hover:bg-gray-50 cursor-pointer">Données</SelectItem>
                <SelectItem value="business" className="hover:bg-gray-50 cursor-pointer">Business</SelectItem>
                <SelectItem value="education" className="hover:bg-gray-50 cursor-pointer">Éducation</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtre favoris */}
            <Button
              className={cn("flex items-center justify-center w-10 h-10", favoritesOnly ? "btn-primary" : "bg-white border border-gray-200 text-[var(--text-primary)] rounded-lg hover:bg-gray-50 transition-colors")}
              onClick={() => setFavoritesOnly(!favoritesOnly)}
            >
              <Star className={cn("h-4 w-4", favoritesOnly && "fill-current")} />
            </Button>
          </div>
        </div>

        {/* Grille de cartes d'outils */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTools.map((tool) => (
            <Card
              key={tool.id}
              className="bg-[#f4f4f5] rounded-xl cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#e8e8e9] overflow-hidden border-0 group"
              onClick={() => handleToolClick(tool)}
            >
              <CardContent className="p-5">
                {/* Partie supérieure avec blur (image, titre, description, tags) */}
                <div className="relative">
                  {/* Contenu qui blur au hover */}
                  <div className="group-hover:blur-[8px] group-hover:opacity-30 transition-all duration-500 ease-out">
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
                      <span className="text-xs px-2 py-1 bg-white text-gray-600 rounded-md font-normal">
                        {tool.category}
                      </span>
                      {tool.tags && tool.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-white text-gray-600 rounded-md font-normal"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Overlay glassmorphism avec features (uniquement sur la partie supérieure) */}
                  {tool.features && tool.features.length > 0 && (
                    <div className="absolute inset-0 flex items-start justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-500 ease-out pt-2">
                      <div
                        className="w-full max-h-full flex flex-col gap-2 overflow-y-auto scrollbar-hide"
                        style={{
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)'
                        }}
                      >
                        {tool.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 text-sm shadow-sm transform transition-all duration-300 ease-out"
                            style={{
                              opacity: 0,
                              animation: 'fadeIn 400ms ease-out forwards',
                              animationDelay: `${index * 50}ms`
                            }}
                          >
                            <Check className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-gray-700 font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Partie basse toujours visible (prix, favoris, bouton utiliser) */}
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
          <Card className="card-clickable">
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