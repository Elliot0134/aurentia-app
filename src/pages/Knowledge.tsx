import { useState } from "react";
import { Book, BookOpen, FileText, Download, Search, ChevronDown, Filter } from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

// Types pour nos ressources
interface Resource {
  id: string;
  title: string;
  description: string;
  type: "article" | "guide" | "template" | "casestudy";
  category: string;
  isFeatured: boolean;
  previewUrl?: string;
}

const Knowledge = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [openArticleId, setOpenArticleId] = useState<string | null>(null);

  // Exemples de ressources pour la page
  const resources: Resource[] = [
    {
      id: "1",
      title: "Réussir son étude de marché",
      description: "Un guide complet pour analyser efficacement votre marché et comprendre votre audience cible.",
      type: "guide",
      category: "business",
      isFeatured: true
    },
    {
      id: "2",
      title: "Template de Business Plan",
      description: "Un modèle structuré pour présenter votre projet de manière professionnelle aux investisseurs.",
      type: "template",
      category: "business",
      isFeatured: true
    },
    {
      id: "3",
      title: "Les 7 étapes pour valider une idée",
      description: "Méthodologie éprouvée pour tester la viabilité de votre concept avant de vous lancer.",
      type: "article",
      category: "innovation",
      isFeatured: false
    },
    {
      id: "4",
      title: "Analyse de la concurrence",
      description: "Comment identifier et évaluer efficacement vos concurrents directs et indirects.",
      type: "guide",
      category: "strategy",
      isFeatured: false
    },
    {
      id: "5",
      title: "Étude de cas: La success story de Doctolib",
      description: "Comment Doctolib a révolutionné la prise de rendez-vous médicaux en France.",
      type: "casestudy",
      category: "success",
      isFeatured: true
    },
    {
      id: "6",
      title: "Modèles économiques innovants",
      description: "Découvrez les business models qui transforment les marchés traditionnels.",
      type: "article",
      category: "innovation",
      isFeatured: true
    }
  ];

  // Filtrer les ressources en fonction de la recherche, la catégorie et le type
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    const matchesType = selectedType === "all" || resource.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  // Les ressources mises en avant
  const featuredResources = resources.filter(resource => resource.isFeatured);

  // Catégories pour le filtre
  const categories = [
    { id: "all", name: "Toutes les ressources" },
    { id: "business", name: "Business" },
    { id: "innovation", name: "Innovation" },
    { id: "strategy", name: "Stratégie" },
    { id: "success", name: "Success Stories" }
  ];

  // Types pour le filtre par tags
  const types = [
    { id: "all", name: "Tous les types" },
    { id: "guide", name: "Guide" },
    { id: "template", name: "Template" },
    { id: "casestudy", name: "Étude de cas" },
    { id: "article", name: "Article" }
  ];

  // Obtenir l'icône en fonction du type de ressource
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="h-5 w-5 text-aurentia-pink" />;
      case "guide":
        return <Book className="h-5 w-5 text-aurentia-blue" />;
      case "template":
        return <FileText className="h-5 w-5 text-aurentia-green" />;
      case "casestudy":
        return <BookOpen className="h-5 w-5 text-aurentia-violet" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Fonction pour afficher le toast lors du téléchargement
  const handleDownload = (resourceId: string) => {
    toast({
      title: "Téléchargement démarré",
      description: "Votre ressource sera disponible dans quelques instants.",
    });
  };

  // Couleur de l'arrière-plan en fonction du type
  const getBgColor = (type: string) => {
    switch (type) {
      case "article":
        return "bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200";
      case "guide":
        return "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200";
      case "template":
        return "bg-gradient-to-br from-green-50 to-green-100 border-green-200";
      case "casestudy":
        return "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200";
      default:
        return "bg-white";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* En-tête de la page */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Ressources</h1>
            <p className="text-gray-600 text-sm mt-1">Ressources et contenu éducatif pour entrepreneurs</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher une ressource..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 w-full md:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="space-y-4 mb-6">
          {/* Filtres de catégories */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="h-4 w-4" />
              Catégories:
            </div>
            {categories.map(category => (
              <button
                key={category.id}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-gradient-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Filtres par type/tags */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="h-4 w-4" />
              Types:
            </div>
            {types.map(type => (
              <button
                key={type.id}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedType === type.id
                    ? "bg-gradient-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>        

        {/* Liste de toutes les ressources */}
        <div>
          <h2 className="text-lg font-medium mb-4">Toutes les ressources</h2>
          {filteredResources.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune ressource ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map(resource => (
                <div 
                  key={resource.id}
                  className={`p-4 rounded-xl ${getBgColor(resource.type)} border transition-all hover:shadow-md cursor-pointer`}
                  onClick={() => setOpenArticleId(resource.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm mb-1">{resource.title}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2">{resource.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50 backdrop-blur-sm">
                      {resource.type === "article" ? "Article" : 
                       resource.type === "guide" ? "Guide" : 
                       resource.type === "template" ? "Template" : "Étude de cas"}
                    </span>
                    <button 
                      className="text-xs text-aurentia-pink font-medium hover:underline flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(resource.id);
                      }}
                    >
                      <Download className="h-3 w-3" />
                      Télécharger
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de détail */}
        {openArticleId && (
          <Dialog open={openArticleId !== null} onOpenChange={(open) => !open && setOpenArticleId(null)}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
              <DialogClose className="absolute right-4 top-4 z-10" />
              
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {resources.find(r => r.id === openArticleId)?.title}
                </h2>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="summary">
                    <AccordionTrigger>Synthèse</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-gray-700">
                        {resources.find(r => r.id === openArticleId)?.description}
                        Cet article explique en détail les différentes étapes et méthodologies pour 
                        réussir dans ce domaine. Une approche structurée garantit de meilleurs résultats.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="content">
                    <AccordionTrigger>Contenu principal</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-gray-700">
                        Le contenu principal aborde plusieurs aspects essentiels pour les entrepreneurs,
                        avec des exemples concrets et des cas d'études. Les méthodes proposées ont été
                        testées et validées par de nombreuses startups à succès.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="methodology">
                    <AccordionTrigger>Méthodologie</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-gray-700">
                        Notre approche méthodologique repose sur l'analyse de données récentes
                        et l'expertise de professionnels du secteur. Les résultats sont présentés
                        de manière structurée pour faciliter la mise en application.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="conclusion">
                    <AccordionTrigger>Conclusion</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-gray-700">
                        En suivant les recommandations détaillées dans cette ressource,
                        vous serez mieux équipé pour relever les défis qui vous attendent
                        et maximiser vos chances de succès dans votre projet entrepreneurial.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="flex justify-center mt-6">
                  <Button className="bg-gradient-primary">
                    Télécharger la ressource complète
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Knowledge;
