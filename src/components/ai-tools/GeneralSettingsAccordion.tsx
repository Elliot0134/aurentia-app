import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { AIToolUserSettings } from '@/types/aiTools';

interface GeneralSettingsAccordionProps {
  toolId: string;
  settings: AIToolUserSettings | null;
  onSettingsChange: (settings: Record<string, any>) => void;
}

interface SettingsData {
  shortTexts: Record<string, string>;
  longTexts: Record<string, string>;
  lists: Record<string, string[]>;
}

export const GeneralSettingsAccordion: React.FC<GeneralSettingsAccordionProps> = ({
  toolId,
  settings,
  onSettingsChange,
}) => {
  const [settingsData, setSettingsData] = useState<SettingsData>({
    shortTexts: {},
    longTexts: {},
    lists: {},
  });

  const [newListItems, setNewListItems] = useState<Record<string, string>>({});

  // Charger les paramètres au montage
  useEffect(() => {
    if (settings?.settings_data) {
      const data = settings.settings_data as SettingsData;
      setSettingsData({
        shortTexts: data.shortTexts || {},
        longTexts: data.longTexts || {},
        lists: data.lists || {},
      });
    }
  }, [settings]);

  // Fonction de sauvegarde avec debounce
  const debounceSave = useCallback(
    debounce((newData: SettingsData) => {
      onSettingsChange(newData);
    }, 500),
    [onSettingsChange]
  );

  // Fonction debounce utilitaire
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  const updateSettings = (newData: SettingsData) => {
    setSettingsData(newData);
    debounceSave(newData);
  };

  const handleShortTextChange = (key: string, value: string) => {
    const newData = {
      ...settingsData,
      shortTexts: { ...settingsData.shortTexts, [key]: value },
    };
    updateSettings(newData);
  };

  const handleLongTextChange = (key: string, value: string) => {
    const newData = {
      ...settingsData,
      longTexts: { ...settingsData.longTexts, [key]: value },
    };
    updateSettings(newData);
  };

  const handleListItemAdd = (listKey: string) => {
    const newItem = newListItems[listKey]?.trim();
    if (!newItem) return;

    const currentList = settingsData.lists[listKey] || [];
    const newData = {
      ...settingsData,
      lists: {
        ...settingsData.lists,
        [listKey]: [...currentList, newItem],
      },
    };
    updateSettings(newData);

    // Vider le champ de saisie
    setNewListItems({ ...newListItems, [listKey]: '' });
  };

  const handleListItemRemove = (listKey: string, index: number) => {
    const currentList = settingsData.lists[listKey] || [];
    const newList = currentList.filter((_, i) => i !== index);
    const newData = {
      ...settingsData,
      lists: { ...settingsData.lists, [listKey]: newList },
    };
    updateSettings(newData);
  };

  const handleNewListItemChange = (listKey: string, value: string) => {
    setNewListItems({ ...newListItems, [listKey]: value });
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="general-settings">
        <AccordionTrigger className="text-left">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-orange-600" />
            <span className="font-medium">Paramètres généraux</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6 pt-4">
            {/* Textes courts */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Textes courts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['entreprise', 'secteur', 'cible', 'budget'].map((key) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`short-${key}`} className="text-sm font-medium capitalize">
                      {key}
                    </Label>
                    <Input
                      id={`short-${key}`}
                      placeholder={`Entrez votre ${key}...`}
                      value={settingsData.shortTexts[key] || ''}
                      onChange={(e) => handleShortTextChange(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Textes longs */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Descriptions détaillées</h4>
              <div className="space-y-4">
                {['description_entreprise', 'objectifs', 'contexte'].map((key) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`long-${key}`} className="text-sm font-medium capitalize">
                      {key.replace('_', ' ')}
                    </Label>
                    <Textarea
                      id={`long-${key}`}
                      placeholder={`Décrivez ${key.replace('_', ' ')}...`}
                      value={settingsData.longTexts[key] || ''}
                      onChange={(e) => handleLongTextChange(key, e.target.value)}
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Listes */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Listes d'éléments</h4>
              <div className="space-y-6">
                {['services', 'concurrents', 'mots_cles'].map((listKey) => (
                  <div key={listKey} className="space-y-3">
                    <Label className="text-sm font-medium capitalize">
                      {listKey.replace('_', ' ')}
                    </Label>
                    
                    {/* Liste des éléments existants */}
                    <div className="space-y-2">
                      {(settingsData.lists[listKey] || []).map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                          <span className="flex-1 text-sm">{item}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleListItemRemove(listKey, index)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Ajouter un nouvel élément */}
                    <div className="flex gap-2">
                      <Input
                        placeholder={`Ajouter ${listKey.replace('_', ' ')}...`}
                        value={newListItems[listKey] || ''}
                        onChange={(e) => handleNewListItemChange(listKey, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleListItemAdd(listKey);
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleListItemAdd(listKey)}
                        disabled={!newListItems[listKey]?.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500 pt-4 border-t">
              💡 Les paramètres sont sauvegardés automatiquement
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};