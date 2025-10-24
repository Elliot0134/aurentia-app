import React, { useState } from 'react';
import { FileText, HelpCircle, BookOpen, ListChecks, GraduationCap, Settings, Lightbulb, Users, CheckCircle, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResourceContent, ResourceTab, ResourceSection, createEmptyBlock } from '@/types/resourceTypes';
import { useResourceTemplates } from '@/hooks/useResourceTemplates';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'guide' | 'process' | 'formation' | 'reference';
  tags: string[];
  content: ResourceContent;
}

interface ResourceTemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (content: ResourceContent) => void;
  organizationId?: string | null;
}

// Définition des templates prédéfinis
const TEMPLATES: Template[] = [
  {
    id: 'guide-demarrage',
    name: 'Guide de démarrage',
    description: 'Guide complet pour onboarder les nouveaux membres. Idéal pour présenter votre organisation, expliquer les étapes initiales et répondre aux questions fréquentes.',
    icon: BookOpen,
    category: 'guide',
    tags: ['onboarding', 'guide', 'débutant'],
    content: {
      version: '2.0',
      tags: ['onboarding', 'guide', 'débutant'],
      metadata: {
        showTableOfContents: true,
        allowComments: true,
        trackReading: true,
      },
      tabs: [
        {
          id: 'tab_intro',
          title: 'Introduction',
          icon: 'BookOpen',
          order: 0,
          sections: [
            {
              id: 'sec_bienvenue',
              title: 'Bienvenue',
              description: 'Message d\'accueil et présentation',
              order: 0,
              collapsible: false,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '# Bienvenue !\n\nNous sommes ravis de vous accueillir. Ce guide vous aidera à démarrer rapidement.' }
                }
              ]
            },
            {
              id: 'sec_objectifs',
              title: 'Objectifs',
              description: 'Ce que vous allez apprendre',
              order: 1,
              collapsible: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: 'À la fin de ce guide, vous serez capable de :\n- Point 1\n- Point 2\n- Point 3' }
                }
              ]
            }
          ]
        },
        {
          id: 'tab_config',
          title: 'Configuration',
          icon: 'Settings',
          order: 1,
          sections: [
            {
              id: 'sec_prerequis',
              title: 'Prérequis',
              order: 0,
              collapsible: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '## Avant de commencer\n\nAssurez-vous d\'avoir :\n- Élément 1\n- Élément 2' }
                }
              ]
            },
            {
              id: 'sec_installation',
              title: 'Installation',
              order: 1,
              collapsible: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '## Étapes d\'installation\n\n1. Première étape\n2. Deuxième étape\n3. Troisième étape' }
                }
              ]
            }
          ]
        },
        {
          id: 'tab_aide',
          title: 'Aide & Support',
          icon: 'HelpCircle',
          order: 2,
          sections: [
            {
              id: 'sec_faq',
              title: 'Questions fréquentes',
              order: 0,
              collapsible: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '### Question 1 ?\nRéponse...\n\n### Question 2 ?\nRéponse...' }
                }
              ]
            },
            {
              id: 'sec_contact',
              title: 'Nous contacter',
              order: 1,
              collapsible: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: 'Besoin d\'aide ? Contactez-nous :\n- Email: support@example.com\n- Téléphone: +33 X XX XX XX XX' }
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'faq',
    name: 'FAQ (Questions fréquentes)',
    description: 'Base de connaissances en format questions-réponses. Parfait pour centraliser les réponses aux questions courantes et réduire les demandes de support.',
    icon: HelpCircle,
    category: 'reference',
    tags: ['faq', 'aide', 'documentation'],
    content: {
      version: '2.0',
      tags: ['faq', 'aide', 'documentation'],
      metadata: {
        showTableOfContents: true,
        allowComments: true,
        trackReading: false,
      },
      tabs: [
        {
          id: 'tab_general',
          title: 'Questions générales',
          icon: 'Info',
          order: 0,
          sections: [
            {
              id: 'sec_q1',
              title: 'Question 1',
              order: 0,
              collapsible: true,
              collapsed: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '**Réponse :** Votre réponse détaillée ici...' }
                }
              ]
            },
            {
              id: 'sec_q2',
              title: 'Question 2',
              order: 1,
              collapsible: true,
              collapsed: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '**Réponse :** Votre réponse détaillée ici...' }
                }
              ]
            }
          ]
        },
        {
          id: 'tab_technique',
          title: 'Questions techniques',
          icon: 'Code',
          order: 1,
          sections: [
            {
              id: 'sec_tech1',
              title: 'Question technique 1',
              order: 0,
              collapsible: true,
              collapsed: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '**Réponse :** Votre réponse technique détaillée...' }
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'processus',
    name: 'Processus/Procédure',
    description: 'Documentez vos workflows et procédures internes étape par étape. Idéal pour standardiser les opérations et former les équipes aux bonnes pratiques.',
    icon: ListChecks,
    category: 'process',
    tags: ['processus', 'procédure', 'workflow'],
    content: {
      version: '2.0',
      tags: ['processus', 'procédure', 'workflow'],
      metadata: {
        showTableOfContents: true,
        allowComments: true,
        trackReading: false,
      },
      tabs: [
        {
          id: 'tab_overview',
          title: 'Vue d\'ensemble',
          icon: 'Eye',
          order: 0,
          sections: [
            {
              id: 'sec_description',
              title: 'Description du processus',
              order: 0,
              collapsible: false,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '## Objectif\n\nDécrivez l\'objectif du processus...\n\n## Parties prenantes\n\n- Rôle 1\n- Rôle 2' }
                }
              ]
            }
          ]
        },
        {
          id: 'tab_etapes',
          title: 'Étapes',
          icon: 'ListChecks',
          order: 1,
          sections: [
            {
              id: 'sec_etape1',
              title: 'Étape 1 : [Nom]',
              order: 0,
              collapsible: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '**Responsable :** [Nom du rôle]\n\n**Actions :**\n1. Action 1\n2. Action 2\n\n**Résultat attendu :** ...' }
                }
              ]
            },
            {
              id: 'sec_etape2',
              title: 'Étape 2 : [Nom]',
              order: 1,
              collapsible: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '**Responsable :** [Nom du rôle]\n\n**Actions :**\n1. Action 1\n2. Action 2\n\n**Résultat attendu :** ...' }
                }
              ]
            }
          ]
        },
        {
          id: 'tab_ressources',
          title: 'Ressources',
          icon: 'Folder',
          order: 2,
          sections: [
            {
              id: 'sec_documents',
              title: 'Documents et fichiers',
              order: 0,
              collapsible: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: 'Ajoutez ici les documents, fichiers et liens utiles pour ce processus.' }
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'formation',
    name: 'Module de formation',
    description: 'Créez des modules de formation pédagogiques avec objectifs, leçons et évaluations. Parfait pour l\'apprentissage structuré et le développement de compétences.',
    icon: GraduationCap,
    category: 'formation',
    tags: ['formation', 'apprentissage', 'tutorial'],
    content: {
      version: '2.0',
      tags: ['formation', 'apprentissage', 'tutorial'],
      metadata: {
        showTableOfContents: true,
        allowComments: true,
        trackReading: true,
      },
      tabs: [
        {
          id: 'tab_intro',
          title: 'Introduction',
          icon: 'BookOpen',
          order: 0,
          sections: [
            {
              id: 'sec_objectifs',
              title: 'Objectifs pédagogiques',
              order: 0,
              collapsible: false,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '## Objectifs d\'apprentissage\n\nÀ la fin de ce module, vous serez capable de :\n- Objectif 1\n- Objectif 2\n- Objectif 3' }
                }
              ]
            },
            {
              id: 'sec_duree',
              title: 'Durée et prérequis',
              order: 1,
              collapsible: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '**Durée estimée :** 2 heures\n\n**Prérequis :**\n- Prérequis 1\n- Prérequis 2' }
                }
              ]
            }
          ]
        },
        {
          id: 'tab_lecon1',
          title: 'Leçon 1',
          icon: 'BookOpen',
          order: 1,
          sections: [
            {
              id: 'sec_theorie',
              title: 'Partie théorique',
              order: 0,
              collapsible: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '### Concepts clés\n\nExpliquez les concepts importants...' }
                }
              ]
            },
            {
              id: 'sec_pratique',
              title: 'Exercice pratique',
              order: 1,
              collapsible: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '### À vous de jouer !\n\n**Consigne :** ...\n\n**Durée :** 15 minutes' }
                }
              ]
            }
          ]
        },
        {
          id: 'tab_evaluation',
          title: 'Évaluation',
          icon: 'CheckCircle',
          order: 2,
          sections: [
            {
              id: 'sec_quiz',
              title: 'Quiz de validation',
              order: 0,
              collapsible: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '### Questions\n\n1. Question 1 ?\n2. Question 2 ?\n3. Question 3 ?' }
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'documentation-technique',
    name: 'Documentation technique',
    description: 'Documentation technique détaillée avec installation, configuration et référence API. Idéal pour les outils internes, intégrations et systèmes techniques.',
    icon: FileText,
    category: 'reference',
    tags: ['documentation', 'technique', 'référence'],
    content: {
      version: '2.0',
      tags: ['documentation', 'technique', 'référence'],
      metadata: {
        showTableOfContents: true,
        allowComments: true,
        trackReading: false,
      },
      tabs: [
        {
          id: 'tab_apercu',
          title: 'Aperçu',
          icon: 'Eye',
          order: 0,
          sections: [
            {
              id: 'sec_presentation',
              title: 'Présentation',
              order: 0,
              collapsible: false,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '# [Nom du projet/outil]\n\n## Description\n\nDescription générale...\n\n## Cas d\'usage\n\n- Usage 1\n- Usage 2' }
                }
              ]
            }
          ]
        },
        {
          id: 'tab_installation',
          title: 'Installation',
          icon: 'Download',
          order: 1,
          sections: [
            {
              id: 'sec_prerequis',
              title: 'Prérequis système',
              order: 0,
              collapsible: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '- Système d\'exploitation : ...\n- Dépendances : ...\n- Configuration minimale : ...' }
                }
              ]
            },
            {
              id: 'sec_install',
              title: 'Instructions d\'installation',
              order: 1,
              collapsible: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '```bash\n# Commandes d\'installation\n```' }
                }
              ]
            }
          ]
        },
        {
          id: 'tab_reference',
          title: 'Référence API',
          icon: 'Code',
          order: 2,
          sections: [
            {
              id: 'sec_endpoints',
              title: 'Endpoints',
              order: 0,
              collapsible: true,
              blocks: [
                {
                  ...createEmptyBlock('text'),
                  data: { markdown: '### GET /api/endpoint\n\n**Description :** ...\n\n**Paramètres :**\n- param1: description\n\n**Réponse :**\n```json\n{\n  "data": "example"\n}\n```' }
                }
              ]
            }
          ]
        }
      ]
    }
  }
];

export function ResourceTemplateSelector({
  open,
  onClose,
  onSelectTemplate,
  organizationId,
}: ResourceTemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'predefined' | 'custom'>('predefined');

  // Fetch custom templates
  const {
    templates: customTemplates,
    isLoading: loadingCustomTemplates,
    deleteTemplate,
    currentUserId,
  } = useResourceTemplates(organizationId);

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'guide', label: 'Guides' },
    { id: 'process', label: 'Processus' },
    { id: 'formation', label: 'Formation' },
    { id: 'reference', label: 'Référence' },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === selectedCategory);

  const filteredCustomTemplates = selectedCategory === 'all'
    ? customTemplates
    : customTemplates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template.content);
    onClose();
  };

  const handleSelectCustomTemplate = (template: typeof customTemplates[0]) => {
    onSelectTemplate(template.content);
    onClose();
  };

  const handleDeleteCustomTemplate = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      deleteTemplate(templateId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choisir un modèle</DialogTitle>
          <DialogDescription>
            Démarrez rapidement avec un modèle prédéfini, utilisez vos modèles personnalisés ou créez une ressource vierge.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'predefined' | 'custom')} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="predefined">
              <BookOpen className="w-4 h-4 mr-2" />
              Modèles prédéfinis
            </TabsTrigger>
            <TabsTrigger value="custom">
              <Sparkles className="w-4 h-4 mr-2" />
              Mes modèles ({customTemplates.length})
            </TabsTrigger>
          </TabsList>

          {/* Category filters */}
          <div className="flex gap-2 flex-wrap pb-4 border-b">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={selectedCategory === cat.id ? 'btn-white-label' : ''}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Predefined templates */}
          <TabsContent value="predefined" className="flex-1 overflow-y-auto mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              {filteredTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2"
                    style={{
                      ['--hover-border' as string]: 'var(--color-primary, #ff5932)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary, #ff5932)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '';
                    }}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, var(--color-primary, #ff5932) 0%, var(--color-secondary, #ff7a59) 100%)'
                          }}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        {template.content.tabs?.length || 0} tabs •{' '}
                        {template.content.tabs?.reduce((acc, tab) => acc + (Array.isArray(tab.sections) ? tab.sections.length : 0), 0) || 0} sections
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Custom templates */}
          <TabsContent value="custom" className="flex-1 overflow-y-auto mt-4">
            {loadingCustomTemplates ? (
              <div className="text-center py-12 text-gray-500">Chargement de vos modèles...</div>
            ) : filteredCustomTemplates.length === 0 ? (
              <Alert className="mb-4">
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  {selectedCategory === 'all'
                    ? "Vous n'avez pas encore créé de modèles personnalisés. Créez une ressource puis sauvegardez-la comme modèle pour la réutiliser facilement."
                    : `Aucun modèle personnalisé dans la catégorie "${categories.find(c => c.id === selectedCategory)?.label}".`
                  }
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                {filteredCustomTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2"
                    style={{
                      ['--hover-border' as string]: 'var(--color-primary, #ff5932)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary, #ff5932)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '';
                    }}
                    onClick={() => handleSelectCustomTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl"
                          style={{
                            background: 'linear-gradient(135deg, var(--color-primary, #ff5932) 0%, var(--color-secondary, #ff7a59) 100%)'
                          }}
                        >
                          {template.icon || '📚'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            {template.created_by === currentUserId && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => handleDeleteCustomTemplate(e, template.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {template.description && (
                            <CardDescription className="text-sm mt-1">
                              {template.description}
                            </CardDescription>
                          )}
                          {template.is_public && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              Public
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {template.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 text-xs text-gray-500">
                        Créé par {template.creator?.first_name || template.creator?.email?.split('@')[0] || 'Utilisateur'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Empty template option */}
        <div className="border-t pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onSelectTemplate({
                version: '2.0',
                tabs: [],
                tags: [],
                metadata: {
                  showTableOfContents: true,
                  allowComments: true,
                  trackReading: false,
                },
              });
              onClose();
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Commencer avec une ressource vierge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ResourceTemplateSelector;
