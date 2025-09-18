import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Filter,
  Star,
  Plus,
  Zap,
  FileText,
  Users,
  TrendingUp,
  ChevronDown,
  SlidersHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

const TemplatePage = () => {
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: ''
  });

  // Données fictives pour les cartes
  const statsData = [
    { title: "Total d'automatisations", value: "24", icon: <Zap className="h-5 w-5" /> },
    { title: "Nombre de partenaires", value: "8", icon: <Users className="h-5 w-5" /> },
    { title: "Ressources disponibles", value: "42", icon: <FileText className="h-5 w-5" /> },
    { title: "Outils actifs", value: "16", icon: <TrendingUp className="h-5 w-5" /> },
  ];

  // Données fictives pour les cartes de contenu
  const contentCards = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    title: `Contenu ${i + 1}`,
    description: "Description détaillée du contenu avec toutes les informations pertinentes.",
    tags: ["Tag 1", "Tag 2", "Tag 3"],
    credits: 5,
    isFavorite: i % 3 === 0,
    image: "/placeholder.svg"
  }));

  const handleSubmitRequest = () => {
    // Logique pour soumettre la demande (à implémenter plus tard)
    console.log('Demande soumise:', formData);
    setDialogOpen(false);
    setFormData({ type: '', title: '', description: '' });
  };

  const handleCardClick = (cardId: number) => {
    navigate(`/template/tool-template`);
  };

  const toggleFavorite = (cardId: number) => {
    setFavorites(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  // Filtrer les cartes
  const filteredCards = contentCards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || card.tags.some(tag =>
      tag.toLowerCase() === selectedCategory.toLowerCase()
    );
    const matchesFavorites = !favoritesOnly || favorites.includes(card.id);
    
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  return (
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[80vw] md:w-11/12 mx-auto px-4">
        {/* En-tête avec titre, sous-titre et boutons */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Page Template</h1>
              <p className="text-gray-600 text-base"> {/* Augmenté de 2px (text-sm -> text-base) */}
                Ceci est une page template pour démontrer la structure de base.
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
                    <DialogTitle>Nouvelle demande de fonctionnalité</DialogTitle>
                    <DialogDescription>
                      En fait, on part de votre demande. Nous nous efforçons d'ajouter les nouvelles fonctionnalités dans les plus brefs délais suite aux demandes de nos utilisateurs.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Type de fonctionnalité</label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="outil">Nouvel outil</SelectItem>
                          <SelectItem value="ressource">Nouvelle ressource</SelectItem>
                          <SelectItem value="automation">Nouvelle automatisation</SelectItem>
                          <SelectItem value="partenaire">Nouveau partenaire</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Titre de la demande</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Ex: Outil de génération de contenu social media"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description détaillée</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Décrivez en détail votre demande..."
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
                    placeholder="Rechercher..."
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
                    <SelectItem value="price-asc">Prix croissant</SelectItem>
                    <SelectItem value="price-desc">Prix décroissant</SelectItem>
                    <SelectItem value="date">Date d'ajout</SelectItem>
                    <SelectItem value="popularity">Popularité</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Filtres supplémentaires */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[180px] focus:ring-0 focus:border-gray-300">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="tag 1">Tag 1</SelectItem>
                    <SelectItem value="tag 2">Tag 2</SelectItem>
                    <SelectItem value="tag 3">Tag 3</SelectItem>
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

        {/* Grille de cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <Card
              key={card.id}
              className="group cursor-pointer transition-all duration-300 overflow-hidden border"
              onClick={() => handleCardClick(card.id)}
            >
              <CardContent className="p-4">
                {/* Titre et description */}
                <CardTitle className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {card.description}
                </CardDescription>
                
                {/* Étiquettes */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {card.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-normal"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Informations de bas de carte */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{card.credits}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1.5 h-8 w-8 transition-opacity rounded-full hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(card.id);
                      }}
                    >
                      <Star className={cn("h-4 w-4", favorites.includes(card.id) && "fill-yellow-400 text-yellow-400")} />
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs px-3 py-1.5 h-auto text-white"
                      style={{ backgroundColor: '#ff5932' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Logique d'utilisation
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
      </div>
    </div>
  );
};

export default TemplatePage;
