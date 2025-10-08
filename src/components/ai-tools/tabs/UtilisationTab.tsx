import React, { useState } from 'react';
import { Play, Copy, Download, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GeneralSettingsAccordion } from '../GeneralSettingsAccordion';
import type { AITool, AIToolUserSettings } from '@/types/aiTools';

interface UtilisationTabProps {
  tool: AITool;
  settings: AIToolUserSettings | null;
  executing: boolean;
  onSaveSettings: (settings: Record<string, any>) => void;
  onExecuteTool: (inputData: Record<string, any>) => Promise<any>;
}

export const UtilisationTab: React.FC<UtilisationTabProps> = ({
  tool,
  settings,
  executing,
  onSaveSettings,
  onExecuteTool,
}) => {
  const [formData, setFormData] = useState({
    sujet: '',
    description: '',
    objectif: '',
    contraintes: '',
    style: '',
    longueur: '',
  });
  
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    // Validation des champs requis
    if (!formData.sujet.trim()) {
      toast({
        title: 'Champ requis',
        description: 'Veuillez renseigner le sujet',
        variant: 'destructive',
      });
      return;
    }

    try {
      const inputData = {
        ...formData,
        timestamp: new Date().toISOString(),
      };

      const response = await onExecuteTool(inputData);
      setResult(response);

      toast({
        title: 'Génération réussie',
        description: 'Votre contenu a été généré avec succès',
      });
    } catch (error) {
      console.error('Error executing tool:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la génération',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      toast({
        title: 'Copié',
        description: 'Le résultat a été copié dans le presse-papiers',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le résultat',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tool.slug}-result-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Téléchargé',
      description: 'Le résultat a été téléchargé',
    });
  };

  return (
    <div className="space-y-6">
      {/* Paramètres généraux */}
      <GeneralSettingsAccordion
        toolId={tool.id}
        settings={settings}
        onSettingsChange={onSaveSettings}
      />

      {/* Interface principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Questionnaire (Gauche) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Questionnaire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sujet (requis) */}
            <div className="space-y-2">
              <Label htmlFor="sujet" className="text-sm font-medium">
                Sujet <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sujet"
                placeholder="Entrez le sujet principal..."
                value={formData.sujet}
                onChange={(e) => handleInputChange('sujet', e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Décrivez plus en détail votre demande..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Objectif */}
            <div className="space-y-2">
              <Label htmlFor="objectif" className="text-sm font-medium">
                Objectif
              </Label>
              <Input
                id="objectif"
                placeholder="Quel est l'objectif visé ?"
                value={formData.objectif}
                onChange={(e) => handleInputChange('objectif', e.target.value)}
              />
            </div>

            {/* Contraintes */}
            <div className="space-y-2">
              <Label htmlFor="contraintes" className="text-sm font-medium">
                Contraintes
              </Label>
              <Textarea
                id="contraintes"
                placeholder="Y a-t-il des contraintes spécifiques ?"
                value={formData.contraintes}
                onChange={(e) => handleInputChange('contraintes', e.target.value)}
                rows={2}
              />
            </div>

            {/* Style */}
            <div className="space-y-2">
              <Label htmlFor="style" className="text-sm font-medium">
                Style souhaité
              </Label>
              <Input
                id="style"
                placeholder="Formel, décontracté, technique..."
                value={formData.style}
                onChange={(e) => handleInputChange('style', e.target.value)}
              />
            </div>

            {/* Longueur */}
            <div className="space-y-2">
              <Label htmlFor="longueur" className="text-sm font-medium">
                Longueur souhaitée
              </Label>
              <Input
                id="longueur"
                placeholder="Court, moyen, long, ou nombre de mots..."
                value={formData.longueur}
                onChange={(e) => handleInputChange('longueur', e.target.value)}
              />
            </div>

            {/* Bouton Générer */}
            <Button
              onClick={handleGenerate}
              disabled={executing || !formData.sujet.trim()}
              className="w-full mt-6"
              size="lg"
            >
              {executing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Générer
                </>
              )}
            </Button>

            {/* Coût en crédits */}
            <div className="text-center text-sm text-gray-600 pt-2">
              💡 Coût : {tool.credits_cost === 0 ? 'Gratuit' : `${tool.credits_cost} crédits`}
            </div>
          </CardContent>
        </Card>

        {/* Résultat (Droite) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Résultat
              </CardTitle>
              
              {result && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {executing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                <p className="text-gray-600">Génération en cours...</p>
                <p className="text-sm text-gray-500">Cela peut prendre quelques secondes</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {typeof result === 'string' 
                      ? result 
                      : JSON.stringify(result, null, 2)
                    }
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Prêt à générer
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Remplissez le formulaire à gauche et cliquez sur "Générer" pour obtenir votre résultat.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};