import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Star,
  Zap,
  Clock,
  Users,
  Download,
  Share2,
  Heart,
  ChevronDown,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import usePageTitle from "@/hooks/usePageTitle";

const ToolTemplatePage = () => {
  usePageTitle("Template Outil");
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [howToUseOpen, setHowToUseOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Données fictives pour l'outil
  const toolData = {
    title: "Outil Template",
    description: "Description complète de cet outil template qui permet de démontrer la structure d'une page de détail d'outil. Cette description peut être plus longue et détaillée.",
    category: "Marketing",
    complexity: "Moyenne",
    price: 5,
    rating: 4.8,
    reviews: 124,
    estimatedTime: "15-20 min",
    outputType: "PDF",
    tags: ["Marketing", "Automatisation", "Génération", "Template"],
    features: [
      "Génération automatique de contenu",
      "Personnalisation avancée",
      "Export multi-formats",
      "Intégration API"
    ],
    whatYouGet: [
      "Document PDF personnalisé",
      "Template Word modifiable",
      "Guide d'utilisation"
    ]
  };

  const handleBackClick = () => {
    navigate('/individual/template/tool-template');
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleUseNow = () => {
    // Logique d'utilisation de l'outil (à implémenter plus tard)
    console.log('Utilisation de l\'outil:', toolData.title);
  };

  // Données fictives pour l'historique
  const historyData = [
    { id: 1, date: "2024-01-15", title: "Projet Marketing Q1", status: "Terminé" },
    { id: 2, date: "2024-01-10", title: "Campagne Social Media", status: "En cours" },
    { id: 3, date: "2024-01-05", title: "Analyse concurrentielle", status: "Terminé" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Bouton retour */}
        <Button 
          variant="ghost" 
          onClick={handleBackClick}
          className="mb-6 p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux outils
        </Button>

        {/* Onglets Navigation */}
        <div className="mb-8">
          <div className="flex gap-4 border-b">
            <Button
              variant={activeTab === 'description' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('description')}
              className={activeTab === 'description' ? 'border-b-2 border-orange-500 rounded-none' : 'rounded-none'}
            >
              Description
            </Button>
            <Button
              variant={activeTab === 'utilisation' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('utilisation')}
              className={activeTab === 'utilisation' ? 'border-b-2 border-orange-500 rounded-none' : 'rounded-none'}
            >
              Utilisation
            </Button>
          </div>
        </div>

        {activeTab === 'description' && (
          <>
            {/* En-tête principal */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Image principale */}
                <div className="lg:w-1/3">
                  <div className="bg-white rounded-xl w-full h-64 shadow-sm border flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-4xl mb-2">🔧</div>
                      <p>Image de l'outil</p>
                    </div>
                  </div>
                </div>

                {/* Informations principales */}
                <div className="lg:w-2/3">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">{toolData.title}</h1>
                      <p className="text-gray-600 text-lg mb-4">{toolData.description}</p>
                      
                      {/* Nombre de crédits sous la description */}
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <span className="text-xl font-bold">{toolData.price}</span>
                        <span className="text-gray-600">crédits</span>
                      </div>
                    </div>

                    {/* Bouton favori */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleFavorite}
                      className="p-2"
                    >
                      <Star className={`h-5 w-5 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Espace vidéo */}
              <div className="mt-8 mb-8">
                <Card className="border">
                  <CardContent className="p-6">
                    <div className="relative bg-gray-100 rounded-xl overflow-hidden" style={{ paddingTop: '56.25%' }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Play className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Vidéo de démonstration</p>
                          <p className="text-sm text-gray-500">Cliquez pour voir comment utiliser cet outil</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {toolData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Contenu détaillé */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Fonctionnalités */}
              <Card className="border">
                <CardHeader>
                  <CardTitle>Fonctionnalités</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {toolData.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#ff5932' }}></div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Ce que vous obtenez */}
              <Card className="border">
                <CardHeader>
                  <CardTitle>Ce que vous obtenez</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {toolData.whatYouGet.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Download className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === 'utilisation' && (
          <div className="space-y-8">
            {/* Accordéon Comment utiliser cet outil */}
            <Card className="border">
              <CardHeader className="pb-4">
                <div
                  className="cursor-pointer flex items-center justify-between"
                  onClick={() => setHowToUseOpen(!howToUseOpen)}
                >
                  <CardTitle>Comment utiliser cet outil ?</CardTitle>
                  <ChevronDown className={cn("h-5 w-5 text-gray-600 transition-transform duration-300", howToUseOpen && "rotate-180")} />
                </div>
              </CardHeader>
              
              <div className={cn(
                "transition-all duration-300 overflow-hidden",
                howToUseOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full text-white flex items-center justify-center font-semibold text-sm" style={{ backgroundColor: '#ff5932' }}>
                        1
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Cliquez sur "Utiliser maintenant"</h4>
                        <p className="text-gray-600 text-sm">Démarrez le processus en cliquant sur le bouton orange ci-dessus.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full text-white flex items-center justify-center font-semibold text-sm" style={{ backgroundColor: '#ff5932' }}>
                        2
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Remplissez les informations demandées</h4>
                        <p className="text-gray-600 text-sm">Suivez les étapes et renseignez les champs nécessaires.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full text-white flex items-center justify-center font-semibold text-sm" style={{ backgroundColor: '#ff5932' }}>
                        3
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Téléchargez votre résultat</h4>
                        <p className="text-gray-600 text-sm">Une fois le traitement terminé, téléchargez vos fichiers générés.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Accordéon Historique */}
            <Card className="border">
              <CardHeader className="pb-4">
                <div
                  className="cursor-pointer flex items-center justify-between"
                  onClick={() => setHistoryOpen(!historyOpen)}
                >
                  <CardTitle>Historique</CardTitle>
                  <ChevronDown className={cn("h-5 w-5 text-gray-600 transition-transform duration-300", historyOpen && "rotate-180")} />
                </div>
              </CardHeader>
              
              <div className={cn(
                "transition-all duration-300 overflow-hidden",
                historyOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {historyData.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                        <Badge
                          variant={item.status === 'Terminé' ? 'default' : 'secondary'}
                          className={item.status === 'Terminé' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                        >
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Formulaire d'utilisation */}
            <Card className="border">
              <CardHeader>
                <CardTitle>Utilisation de l'outil</CardTitle>
                <CardDescription>Remplissez les informations ci-dessous pour utiliser l'outil</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nom du projet</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Saisissez le nom de votre projet"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={4}
                      placeholder="Décrivez votre projet..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Catégorie</label>
                    <select className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option>Sélectionnez une catégorie</option>
                      <option>Marketing</option>
                      <option>Juridique</option>
                      <option>Finance</option>
                    </select>
                  </div>
                  <Button
                    className="w-full text-white"
                    style={{ backgroundColor: '#ff5932' }}
                    onClick={handleUseNow}
                  >
                    Générer le résultat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolTemplatePage;
