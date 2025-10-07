import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  Star,
  Zap,
  Clock,
  Play,
  CheckCircle,
  XCircle,
  ChevronDown,
  Settings,
  FileText,
  History,
  Copy,
  Download,
  Loader2,
  Plus,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIToolDetails, useAIToolsList } from '@/hooks/useAIToolsNew';
import { useCustomModalTabs } from '@/components/deliverables/shared/useCustomModalTabs';

// Type pour les liens internes
interface InternalLink {
  id: string;
  url: string;
  description: string;
}

const ToolDetailPage = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();
  const { toggleFavorite, favorites } = useAIToolsList();
  
  const {
    tool,
    loading,
    history,
    settings,
    executing,
    saveSettings,
    executeTool,
  } = useAIToolDetails(id || '');

  // États pour les accordéons
  const [paramsOpen, setParamsOpen] = useState(true); // Accordéon ouvert par défaut
  const [howToUseOpen, setHowToUseOpen] = useState(false);
  
  // États pour les formulaires
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [paramSettings, setParamSettings] = useState<Record<string, any>>({});
  const [result, setResult] = useState<string | null>(null);
  
  // État pour la modal d'historique
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // État pour la sauvegarde automatique
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Hook pour les onglets avec transition
  const tabs = ['informations', 'parametres', 'utilisation', 'historique'];
  const {
    activeTab,
    isTransitioning,
    modalHeight,
    contentRef,
    modalRef,
    handleTabChange,
    resetTab
  } = useCustomModalTabs({
    tabs,
    defaultTab: 'informations'
  });

  const handleBackClick = () => {
    navigate('/individual/outils');
  };

  const handleToggleFavorite = () => {
    if (tool) {
      toggleFavorite(tool.id);
    }
  };

  // Fonction de sauvegarde automatique avec debounce
  const autoSaveSettings = useCallback((newSettings: Record<string, any>) => {
    // Annuler le timer précédent s'il existe
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Programmer une nouvelle sauvegarde dans 2 secondes
    const newTimeout = setTimeout(async () => {
      try {
        await saveSettings(newSettings);
        toast.success("Paramètres sauvegardés automatiquement");
      } catch (error) {
        console.error("Erreur lors de la sauvegarde automatique:", error);
        toast.error("Erreur lors de la sauvegarde automatique");
      }
    }, 2000);

    setSaveTimeout(newTimeout);
  }, [saveTimeout, saveSettings]);

  // Fonction pour mettre à jour les paramètres avec sauvegarde automatique
  const updateParamSettings = useCallback((newSettings: Record<string, any>) => {
    setParamSettings(newSettings);
    autoSaveSettings(newSettings);
  }, [autoSaveSettings]);

  // Nettoyer le timer au démontage du composant
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  // Synchroniser les settings avec paramSettings
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setParamSettings(settings);
    }
  }, [settings]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.theme?.trim()) {
      toast.error("Veuillez saisir un thème pour votre article");
      return;
    }

    if (!formData.clientType) {
      toast.error("Veuillez sélectionner un type de client");
      return;
    }

    setResult("Génération en cours...");

    try {
      const response = await executeTool({
        theme: formData.theme,
        additionalInfo: formData.additionalInfo || '',
        referenceArticle: formData.referenceArticle || '',
        clientType: formData.clientType
      });

      if (response.success && response.data) {
        // Traiter la réponse du webhook
        let content = '';
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          // Si c'est un tableau, prendre le premier élément et extraire le texte
          const firstItem = response.data[0];
          if (firstItem && firstItem.text) {
            content = firstItem.text;
          } else {
            content = JSON.stringify(response.data, null, 2);
          }
        } else if (response.data.content) {
          // Si c'est un objet avec un champ content
          content = response.data.content;
        } else if (response.data.text) {
          // Si c'est un objet avec un champ text
          content = response.data.text;
        } else {
          // Fallback : afficher le JSON
          content = JSON.stringify(response.data, null, 2);
        }

        setResult(content);
        toast.success("Article généré avec succès !");
      } else {
        throw new Error(response.error || "Erreur inconnue");
      }
    } catch (error) {
      console.error("Erreur lors de la génération:", error);
      setResult(null);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la génération de l'article");
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };

  const downloadResult = () => {
    if (result) {
      const blob = new Blob([result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tool?.title}_result.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openHistoryModal = (historyItem: any) => {
    setSelectedHistory(historyItem);
    setHistoryModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Outil non trouvé</h1>
          <p className="text-gray-600 mb-6">L'outil que vous recherchez n'existe pas ou n'est plus disponible.</p>
          <Button onClick={handleBackClick}>
            Retour aux outils
          </Button>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.includes(tool.id);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'parametres':
        return (
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Paramètres Généraux
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Public cible supprimé */}

                {/* Tableau des liens internes */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Liens internes</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newLink: InternalLink = {
                          id: Date.now().toString(),
                          url: '',
                          description: ''
                        };
                        const currentLinks = paramSettings.internalLinks || [];
                        updateParamSettings({ 
                          ...paramSettings, 
                          internalLinks: [...currentLinks, newLink] 
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un lien
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>URL</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(paramSettings.internalLinks || []).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-gray-500 py-6">
                              Aucun lien ajouté. Cliquez sur "Ajouter un lien" pour commencer.
                            </TableCell>
                          </TableRow>
                        ) : (
                          (paramSettings.internalLinks || []).map((link: InternalLink, index: number) => (
                            <TableRow key={link.id}>
                              <TableCell>
                                <Input
                                  placeholder="https://example.com/article"
                                  value={link.url}
                                  onChange={(e) => {
                                    const updatedLinks = [...(paramSettings.internalLinks || [])];
                                    updatedLinks[index] = { ...link, url: e.target.value };
                                    updateParamSettings({ 
                                      ...paramSettings, 
                                      internalLinks: updatedLinks 
                                    });
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  placeholder="Description du lien"
                                  value={link.description}
                                  onChange={(e) => {
                                    const updatedLinks = [...(paramSettings.internalLinks || [])];
                                    updatedLinks[index] = { ...link, description: e.target.value };
                                    updateParamSettings({ 
                                      ...paramSettings, 
                                      internalLinks: updatedLinks 
                                    });
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const updatedLinks = (paramSettings.internalLinks || []).filter((_: any, i: number) => i !== index);
                                    updateParamSettings({ 
                                      ...paramSettings, 
                                      internalLinks: updatedLinks 
                                    });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Phrase d'aide supprimée */}
                </div>

                <Button 
                  variant="outline" 
                  onClick={async () => {
                    try {
                      await saveSettings(paramSettings);
                      toast.success("Paramètres sauvegardés avec succès !");
                    } catch (error) {
                      toast.error("Erreur lors de la sauvegarde des paramètres");
                    }
                  }}
                  className="w-full"
                  disabled={executing}
                >
                  {executing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    'Sauvegarder les paramètres'
                  )}
                </Button>
              </CardContent>
            </div>
          </div>
        );

      case 'utilisation':
        return (
          <div className="w-full">
            {/* Zone principale - 2 colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne INPUT */}
              <div className="bg-white rounded-lg shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Zone d'entrée</CardTitle>
                  <CardDescription>Configurez votre article de blog SEO</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    {/* Thème de l'article */}
                    <div>
                      <Label htmlFor="theme">Thème de l'article *</Label>
                      <Input
                        id="theme"
                        placeholder="Ex: Les tendances du marketing digital en 2025"
                        value={formData.theme || ''}
                        onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                        className="w-full"
                        required
                      />
                    </div>

                    {/* Informations supplémentaires */}
                    <div>
                      <Label htmlFor="additional-info">Informations supplémentaires</Label>
                      <Textarea
                        id="additional-info"
                        placeholder="Ajoutez des détails, des points spécifiques à traiter, votre angle d'approche..."
                        value={formData.additionalInfo || ''}
                        onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                        className="w-full"
                        rows={4}
                      />
                    </div>

                    {/* Article de blog de référence */}
                    <div>
                      <Label htmlFor="reference-article">Article de blog de référence</Label>
                      <Input
                        id="reference-article"
                        placeholder="https://example.com/article-de-reference"
                        value={formData.referenceArticle || ''}
                        onChange={(e) => setFormData({ ...formData, referenceArticle: e.target.value })}
                        className="w-full"
                        type="url"
                      />
                    </div>

                    {/* Type de client */}
                    <div>
                      <Label>Type de client *</Label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant={formData.clientType === 'particulier' ? 'default' : 'outline'}
                          onClick={() => setFormData({ ...formData, clientType: 'particulier' })}
                          className="flex-1"
                        >
                          Particulier
                        </Button>
                        <Button
                          type="button"
                          variant={formData.clientType === 'entreprise' ? 'default' : 'outline'}
                          onClick={() => setFormData({ ...formData, clientType: 'entreprise' })}
                          className="flex-1"
                        >
                          Entreprise
                        </Button>
                        <Button
                          type="button"
                          variant={formData.clientType === 'organisme' ? 'default' : 'outline'}
                          onClick={() => setFormData({ ...formData, clientType: 'organisme' })}
                          className="flex-1"
                        >
                          Organisme
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-1 text-sm">
                        <img src="/credit-3D.png" alt="Crédit" className="w-5 h-5" style={{ display: 'inline-block' }} />
                        <span className="font-semibold text-gray-700">{tool.credits_cost}</span>
                      </div>
                      <Button
                        type="submit"
                        disabled={executing || !formData.theme?.trim() || !formData.clientType}
                        className="text-white"
                        style={{ backgroundColor: '#ff5932' }}
                      >
                        {executing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Génération...
                          </>
                        ) : (
                          'Générer l\'article'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </div>

              {/* Colonne OUTPUT */}
              <div className="bg-white rounded-lg shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Résultat</CardTitle>
                  <CardDescription>Le résultat généré apparaîtra ici</CardDescription>
                </CardHeader>
                <CardContent>
                  {!result ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>Le résultat s'affichera ici</p>
                      <p className="text-sm">Remplissez le formulaire et cliquez sur "Générer"</p>
                    </div>
                  ) : result === "Génération en cours..." ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-12 w-12 mx-auto mb-3 text-orange-500 animate-spin" />
                      <p className="text-gray-600">Génération en cours</p>
                      <p className="text-sm text-gray-500">Veuillez patienter...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                        <div className="markdown-content text-sm text-gray-700">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({children}) => <h1 className="text-xl font-bold mb-4 text-gray-900">{children}</h1>,
                              h2: ({children}) => <h2 className="text-lg font-semibold mb-3 text-gray-800">{children}</h2>,
                              h3: ({children}) => <h3 className="text-md font-medium mb-2 text-gray-800">{children}</h3>,
                              p: ({children}) => <p className="mb-3 leading-relaxed">{children}</p>,
                              ul: ({children}) => <ul className="mb-3 ml-4 list-disc">{children}</ul>,
                              ol: ({children}) => <ol className="mb-3 ml-4 list-decimal">{children}</ol>,
                              li: ({children}) => <li className="mb-1">{children}</li>,
                              strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                              em: ({children}) => <em className="italic">{children}</em>,
                              code: ({children}) => <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                              pre: ({children}) => <pre className="bg-gray-800 text-gray-100 p-3 rounded-md overflow-x-auto mb-3">{children}</pre>,
                              blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-3">{children}</blockquote>,
                              a: ({href, children}) => <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                              table: ({children}) => <table className="w-full border-collapse border border-gray-300 mb-3">{children}</table>,
                              th: ({children}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-semibold">{children}</th>,
                              td: ({children}) => <td className="border border-gray-300 px-2 py-1">{children}</td>
                            }}
                          >
                            {result}
                          </ReactMarkdown>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={copyToClipboard}
                          className="flex-1"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copier
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={downloadResult}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>
            </div>
          </div>
        );

      case 'informations':
        return (
          <div className="w-full">
            {/* En-tête avec informations de l'outil */}
            <div className="bg-white rounded-lg shadow-lg border-0">
              <div className="p-8">
                {/* Première ligne - Image et Titre/Description */}
                <div className="flex items-start gap-5 mb-6">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    {tool.image_url ? (
                      <img 
                        src={tool.image_url} 
                        alt={tool.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="text-4xl">🔧</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Titre et description - 20px à droite de l'image */}
                  <div style={{ marginLeft: '20px' }} className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{tool.title}</h1>
                    <p className="text-gray-600 leading-relaxed">{tool.description}</p>
                  </div>
                </div>

                {/* Tags avec icône étiquette */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tool.tags && tool.tags.length > 0 ? tool.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {tag}
                      </span>
                    )) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        Outil SEO
                      </span>
                    )}
                  </div>
                </div>

                {/* Trois containers en colonnes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Container Temps estimé */}
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Temps estimé</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {tool.estimated_time || '5-10 minutes'}
                    </div>
                  </div>

                  {/* Container Crédits */}
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <img src="/credit-3D.png" alt="Crédit" className="w-5 h-5" />
                      <span className="text-sm font-medium text-gray-600">Coût</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {tool.credits_cost} crédits
                    </div>
                  </div>

                  {/* Container Catégorie */}
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-600">Catégorie</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {tool.category}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vidéo YouTube - Pleine largeur */}
            <div className="mt-6 mb-6">
              <div className="flex justify-center">
                <div className="relative bg-transparent rounded-xl overflow-hidden shadow-2xl" style={{ width: '100%', maxWidth: '800px', aspectRatio: '16/9' }}>
                  {tool.video_url ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={tool.video_url.includes('youtube.com') || tool.video_url.includes('youtu.be') 
                        ? tool.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
                        : tool.video_url
                      }
                      title="Vidéo de démonstration"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-xl"
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
                      <div className="text-center">
                        <Play className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Vidéo de démonstration</p>
                        <p className="text-sm text-gray-500">Aucune vidéo disponible</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Deux colonnes - Fonctionnalités et Comment utiliser */}
            <div className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Colonne gauche - Fonctionnalités */}
                <div className="bg-white rounded-lg shadow-lg border-0">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Fonctionnalités</h2>
                    <ul className="space-y-3">
                      {tool.features && tool.features.length > 0 ? tool.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#ff5932' }}></div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      )) : (
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#ff5932' }}></div>
                          <span className="text-gray-700">Génération de contenu optimisé</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Colonne droite - Comment utiliser cet outil */}
                <div className="bg-white rounded-lg shadow-lg border-0">
                  <div className="p-6">
                    <div
                      className="cursor-pointer flex items-center justify-between mb-4"
                      onClick={() => setHowToUseOpen(!howToUseOpen)}
                    >
                      <h2 className="text-xl font-bold text-gray-900">Comment utiliser cet outil ?</h2>
                      <ChevronDown className={cn("h-5 w-5 text-gray-600 transition-transform duration-300", howToUseOpen && "rotate-180")} />
                    </div>
                    
                    <div className={cn(
                      "transition-all duration-300 overflow-hidden",
                      howToUseOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full text-white flex items-center justify-center font-semibold text-sm" style={{ backgroundColor: '#ff5932' }}>
                            1
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Configurez vos paramètres</h4>
                            <p className="text-gray-600 text-sm">Définissez votre public cible et le format de sortie souhaité dans les paramètres généraux.</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full text-white flex items-center justify-center font-semibold text-sm" style={{ backgroundColor: '#ff5932' }}>
                            2
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Saisissez votre contenu</h4>
                            <p className="text-gray-600 text-sm">Remplissez le formulaire avec votre texte principal et vos instructions spéciales.</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full text-white flex items-center justify-center font-semibold text-sm" style={{ backgroundColor: '#ff5932' }}>
                            3
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Générez le résultat</h4>
                            <p className="text-gray-600 text-sm">Cliquez sur "Générer" et obtenez votre contenu optimisé en quelques secondes.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );


      case 'historique':
        return (
          <div className="w-full space-y-6">
            {history.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune utilisation pour le moment</h3>
                <p className="text-gray-500">Votre historique d'utilisation apparaîtra ici après avoir utilisé l'outil.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="border rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => openHistoryModal(item)}>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {item.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : item.status === 'failed' ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : item.status === 'processing' ? (
                            <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-600" />
                          )}
                          <div>
                            <p className="font-medium">Utilisation du {formatDate(item.created_at)}</p>
                            <p className="text-sm text-gray-500">{item.credits_used} crédits utilisés</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={item.status === 'completed' ? 'default' : 'destructive'}
                            className={item.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                     item.status === 'failed' ? 'bg-red-100 text-red-700' :
                                     item.status === 'processing' ? 'bg-yellow-100 text-yellow-700' : 
                                     'bg-gray-100 text-gray-700'}
                          >
                            {item.status === 'completed' ? 'Terminé' : 
                             item.status === 'failed' ? 'Échoué' :
                             item.status === 'processing' ? 'En cours' : 'En attente'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Voir le résultat
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
  <div className="min-h-screen" style={{ background: '#f4f4f1' }}>
      <div 
        className="max-w-7xl mx-auto px-4 py-8"
        style={{ width: '90%', maxWidth: '1400px' }}
      >
        {/* Bouton retour */}
        <Button 
          variant="ghost" 
          onClick={handleBackClick}
          className="mb-6 p-2 hover:bg-gray-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux outils
        </Button>

        {/* Container principal transparent */}
        <Card className="bg-transparent shadow-none border-0 rounded-lg overflow-hidden">
          {/* Barre d'onglets style popup livrable */}
          <div className="border-b border-gray-200 bg-white rounded-lg">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => handleTabChange('informations')}
                className={`py-3 px-6 text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'informations'
                    ? "border-b-2 text-gray-900"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={activeTab === 'informations' ? { borderBottomColor: '#ff5932', color: '#ff5932' } : {}}
              >
                <FileText className="h-4 w-4" />
                Informations
              </button>
              <button
                onClick={() => handleTabChange('parametres')}
                className={`py-3 px-6 text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'parametres'
                    ? "border-b-2 text-gray-900" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={activeTab === 'parametres' ? { borderBottomColor: '#ff5932', color: '#ff5932' } : {}}
              >
                <Settings className="h-4 w-4" />
                Paramètres généraux
              </button>
              <button
                onClick={() => handleTabChange('utilisation')}
                className={`py-3 px-6 text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'utilisation'
                    ? "border-b-2 text-gray-900" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={activeTab === 'utilisation' ? { borderBottomColor: '#ff5932', color: '#ff5932' } : {}}
              >
                <Zap className="h-4 w-4" />
                Utilisation
              </button>
              <button
                onClick={() => handleTabChange('historique')}
                className={`py-3 px-6 text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'historique'
                    ? "border-b-2 text-gray-900"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={activeTab === 'historique' ? { borderBottomColor: '#ff5932', color: '#ff5932' } : {}}
              >
                <History className="h-4 w-4" />
                Historique
              </button>
            </div>
          </div>

          {/* Contenu des onglets */}
          <div className="relative overflow-hidden">
            <div
              ref={contentRef}
              className={`transition-all duration-300 ${
                isTransitioning ? 'opacity-0 blur-sm' : 'opacity-100 blur-0'
              }`}
            >
              {renderTabContent()}
            </div>
          </div>
        </Card>

        {/* Modal pour les détails de l'historique */}
        <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de l'utilisation</DialogTitle>
              <DialogDescription>
                Informations détaillées sur cette utilisation de l'outil
              </DialogDescription>
            </DialogHeader>
            {selectedHistory && (
              <div className="space-y-4">
                {/* Métadonnées */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="text-sm">{formatDate(selectedHistory.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Statut</p>
                    <Badge 
                      className={selectedHistory.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                    >
                      {selectedHistory.status === 'completed' ? 'Terminé' : 'Échoué'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Crédits</p>
                    <p className="text-sm">{selectedHistory.credits_used}</p>
                  </div>
                </div>

                {/* Données d'entrée */}
                <div>
                  <h4 className="font-medium mb-2">Données d'entrée</h4>
                  <div className="bg-gray-50 p-3 rounded border text-sm">
                    <pre className="whitespace-pre-wrap">
                      {selectedHistory.input_data ? 
                        (typeof selectedHistory.input_data === 'string' ? 
                          selectedHistory.input_data : 
                          JSON.stringify(selectedHistory.input_data, null, 2)
                        ) : 
                        'Aucune donnée d\'entrée'
                      }
                    </pre>
                  </div>
                </div>

                {/* Résultat */}
                {selectedHistory.output_data && (
                  <div>
                    <h4 className="font-medium mb-2">Résultat</h4>
                    <div className="bg-green-50 p-3 rounded border border-green-200 text-sm">
                      <pre className="whitespace-pre-wrap">
                        {typeof selectedHistory.output_data === 'string' ? 
                          selectedHistory.output_data : 
                          JSON.stringify(selectedHistory.output_data, null, 2)
                        }
                      </pre>
                    </div>
                  </div>
                )}

                {/* Erreur */}
                {selectedHistory.status === 'failed' && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Erreur</h4>
                    <div className="bg-red-50 p-3 rounded border border-red-200 text-sm text-red-700">
                      Une erreur s'est produite lors du traitement.
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ToolDetailPage;