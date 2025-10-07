import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Credit3DDisplay } from '@/components/ui/Credit3DDisplay';
import { Zap, Clock, Settings, FileText } from 'lucide-react';
import type { AITool, AIToolUsageHistory, AIToolUserSettings } from '@/types/aiTools';

interface ToolDetailTabsProps {
  tool: AITool;
  history: AIToolUsageHistory[];
  settings: AIToolUserSettings | null;
  executing: boolean;
  onSaveSettings: (settings: Partial<AIToolUserSettings>) => Promise<void>;
  onExecuteTool: (params: Record<string, any>) => Promise<any>;
}

export const ToolDetailTabs: React.FC<ToolDetailTabsProps> = ({
  tool,
  history,
  settings,
  executing,
  onSaveSettings,
  onExecuteTool
}) => {
  const [activeTab, setActiveTab] = useState('description');
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onExecuteTool(formData);
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

  return (
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger 
              value="description" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <FileText className="h-4 w-4" />
              Description
            </TabsTrigger>
            <TabsTrigger 
              value="usage" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Zap className="h-4 w-4" />
              Utilisation
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Clock className="h-4 w-4" />
              Historique
            </TabsTrigger>
          </TabsList>
          {/* Ajout d'un espace de 10px sous la navbar/onglets */}
          <div className="bg-transparent" style={{ marginTop: 10 }}>
          <TabsTrigger 
            value="description" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <FileText className="h-4 w-4" />
            Description
          </TabsTrigger>
          <TabsTrigger 
            value="usage" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Zap className="h-4 w-4" />
            Utilisation
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Clock className="h-4 w-4" />
            Historique
          </TabsTrigger>
        </TabsList>

  <div className="bg-transparent">
          <TabsContent value="description" className="space-y-6">
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Description détaillée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{tool.description}</p>
                  
                  {tool.features && tool.features.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-lg mb-3">Fonctionnalités principales</h4>
                      <ul className="space-y-2">
                        {tool.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Coût d'utilisation</span>
                    </div>
                    <Credit3DDisplay credits={tool.credits_cost} size="sm" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  Utiliser l'outil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="input-text" className="text-sm font-medium">
                        Texte d'entrée
                      </Label>
                      <Textarea
                        id="input-text"
                        placeholder="Saisissez votre texte ici..."
                        value={formData.text || ''}
                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                        className="mt-1 min-h-[120px]"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="parameters" className="text-sm font-medium">
                        Paramètres additionnels (optionnel)
                      </Label>
                      <Input
                        id="parameters"
                        placeholder="ex: style=professionnel, ton=amical"
                        value={formData.parameters || ''}
                        onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Credit3DDisplay credits={tool.credits_cost} size="sm" />
                    <Button 
                      type="submit" 
                      disabled={executing || !formData.text}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {executing ? 'Exécution...' : 'Exécuter l\'outil'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Historique d'utilisation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Aucune utilisation précédente</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Votre historique d'utilisation apparaîtra ici
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((entry) => (
                      <div 
                        key={entry.id} 
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={entry.status === 'completed' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {entry.status === 'completed' ? 'Succès' : 
                               entry.status === 'failed' ? 'Erreur' :
                               entry.status === 'processing' ? 'En cours' : 'En attente'}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(entry.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Credit3DDisplay credits={entry.credits_used} size="sm" />
                          </div>
                        </div>
                        
                        {entry.input_data && (
                          <div className="mb-2">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Entrée:</h5>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {typeof entry.input_data === 'string' 
                                ? entry.input_data 
                                : JSON.stringify(entry.input_data, null, 2)
                              }
                            </p>
                          </div>
                        )}
                        
                        {entry.output_data && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Résultat:</h5>
                            <p className="text-sm text-gray-600 bg-green-50 p-2 rounded">
                              {typeof entry.output_data === 'string' 
                                ? entry.output_data 
                                : JSON.stringify(entry.output_data, null, 2)
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};