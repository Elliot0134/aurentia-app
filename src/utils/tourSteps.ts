import { DriveStep } from 'driver.js';

/**
 * Définitions des étapes du tour interactif du ResourceBuilder
 * 20 étapes couvrant toutes les fonctionnalités principales
 */

export const RESOURCE_BUILDER_TOUR_STEPS: DriveStep[] = [
  // Step 1: Welcome
  {
    popover: {
      title: '👋 Bienvenue dans le Créateur de Ressources',
      description:
        'Ce guide interactif vous montrera comment créer des ressources riches et bien structurées pour votre organisation. Vous pouvez quitter à tout moment avec Échap.',
      side: 'bottom',
      align: 'center',
    },
  },

  // Step 2: Interface Overview
  {
    element: '[data-tour="builder-main"]',
    popover: {
      title: '📐 Vue d\'ensemble de l\'interface',
      description:
        'L\'éditeur se compose de plusieurs parties : la barre de tabs en haut pour organiser votre contenu, les sections au centre pour structurer, et les outils d\'aide sur le côté.',
      side: 'bottom',
      align: 'start',
    },
  },

  // Step 3: Tags Section
  {
    element: '[data-tour="tags-section"]',
    popover: {
      title: '🏷️ Tags et Catégorisation',
      description:
        'Commencez par ajouter des tags pour catégoriser votre ressource. Les tags facilitent la recherche et l\'organisation. Tapez pour voir les suggestions automatiques.',
      side: 'bottom',
      align: 'start',
    },
  },

  // Step 4: Tab Bar
  {
    element: '[data-tour="tab-bar"]',
    popover: {
      title: '📑 Organisation par Tabs',
      description:
        'Les tabs permettent d\'organiser votre contenu en grandes sections thématiques. Par exemple : "Introduction", "Configuration", "FAQ". Idéal pour les longues ressources.',
      side: 'bottom',
      align: 'start',
    },
  },

  // Step 5: Add Tab Button
  {
    element: '[data-tour="add-tab-button"]',
    popover: {
      title: '➕ Ajouter un Tab',
      description:
        'Cliquez ici pour créer un nouveau tab. Vous pourrez ensuite le renommer, changer son icône, et le réorganiser par glisser-déposer.',
      side: 'left',
      align: 'start',
    },
  },

  // Step 6: Tab Actions
  {
    element: '[data-tour="tab-actions"]',
    popover: {
      title: '⚙️ Actions sur les Tabs',
      description:
        'Chaque tab a ses propres contrôles : glisser pour réorganiser, éditer pour changer le titre/icône, ou supprimer. Essayez le glisser-déposer !',
      side: 'bottom',
      align: 'start',
    },
  },

  // Step 7: Sections Intro
  {
    element: '[data-tour="sections-container"]',
    popover: {
      title: '📦 Sections Collapsibles',
      description:
        'Chaque tab contient des sections. Les sections permettent de structurer votre contenu avec des titres clairs et peuvent être repliées pour faciliter la navigation.',
      side: 'left',
      align: 'start',
    },
  },

  // Step 8: Add Section Button
  {
    element: '[data-tour="add-section-button"]',
    popover: {
      title: '➕ Créer une Section',
      description:
        'Ajoutez une nouvelle section ici. Donnez-lui un titre descriptif et optionnellement une description. Les sections peuvent aussi être réorganisées.',
      side: 'left',
      align: 'start',
    },
  },

  // Step 9: Section Header
  {
    element: '[data-tour="section-header"]',
    popover: {
      title: '📝 En-tête de Section',
      description:
        'Chaque section a un titre, une description optionnelle, et peut être repliée. Cliquez sur l\'en-tête pour replier/déplier le contenu.',
      side: 'bottom',
      align: 'start',
    },
  },

  // Step 10: Slash Command
  {
    element: '[data-tour="section-content"]',
    popover: {
      title: '⌨️ Menu Slash (/)',
      description:
        'Tapez "/" n\'importe où dans une section pour ouvrir le menu rapide. C\'est le moyen le plus rapide d\'ajouter du contenu : texte, image, vidéo, etc.',
      side: 'left',
      align: 'start',
    },
  },

  // Step 11: Block Types
  {
    popover: {
      title: '🧩 19 Types de Blocks Disponibles',
      description:
        'Le créateur de ressources propose 19 types de blocks organisés en 3 catégories :\n\n**Contenu Basique** (6) :\nTexte, Image, Vidéo, Fichier, Tableau, Séparateur\n\n**Layouts** (6) :\nTabs, Colonnes, Grille, Accordéon, Callout, Toggle\n\n**Interactifs** (7) :\nBouton, Alerte, Checklist, Code, Citation, Embed, Quiz\n\nUtilisez "/" dans une section pour accéder au menu rapide.',
      side: 'bottom',
      align: 'center',
    },
  },

  // Step 12: Layout Blocks
  {
    popover: {
      title: '📐 Blocks de Layout Avancés',
      description:
        'Les blocks de layout structurent votre contenu de façon avancée :\n\n• **Colonnes** : Organisez le contenu côte à côte (avec défilement automatique)\n• **Grille** : Disposition en grille responsive\n• **Accordéon** : Sections pliables/dépliables\n• **Tabs** : Contenu organisé par onglets\n• **Callout** : Mises en évidence colorées\n• **Toggle** : Afficher/masquer du contenu\n\nParfaits pour créer des mises en page professionnelles !',
      side: 'bottom',
      align: 'center',
    },
  },

  // Step 13: Text Block
  {
    element: '[data-tour="text-block"]',
    popover: {
      title: '✍️ Block Texte / Markdown',
      description:
        'Le block texte supporte Markdown complet : titres, listes, liens, **gras**, *italique*, code, et plus. Cliquez sur "Aperçu" pour voir le rendu final.',
      side: 'left',
      align: 'start',
    },
  },

  // Step 13: Image Block
  {
    element: '[data-tour="image-block"]',
    popover: {
      title: '🖼️ Block Image',
      description:
        'Uploadez des images depuis votre appareil. Formats supportés : JPG, PNG, GIF, WebP. Ajoutez une légende et un texte alternatif pour l\'accessibilité.',
      side: 'left',
      align: 'start',
    },
  },

  // Step 14: Video Block
  {
    element: '[data-tour="video-block"]',
    popover: {
      title: '🎥 Block Vidéo',
      description:
        'Intégrez des vidéos depuis YouTube, Vimeo, ou Dailymotion. Collez simplement l\'URL et la vidéo sera automatiquement intégrée de manière responsive.',
      side: 'left',
      align: 'start',
    },
  },

  // Step 15: Block Titles Feature
  {
    element: '[data-tour="block-header"]',
    popover: {
      title: '✏️ Titres de Blocks',
      description:
        'Nouveauté : Tous les blocks peuvent maintenant avoir un titre optionnel !\n\n**Comment l\'utiliser :**\n• Cliquez sur l\'icône "Type" (A) ou "Modifier" (crayon)\n• Entrez votre titre dans le champ\n• Appuyez sur Entrée pour sauvegarder ou Échap pour annuler\n\n**Quand l\'utiliser :**\nParfait pour organiser le contenu et créer des ancres de navigation claires.',
      side: 'left',
      align: 'start',
    },
  },

  // Step 16: Block Actions
  {
    element: '[data-tour="block-header"]',
    popover: {
      title: '🎯 Actions sur les Blocks',
      description:
        'Chaque block actif affiche un en-tête avec plusieurs contrôles :\n\n• **Poignée de glisser** : Réorganisez par drag & drop\n• **Bouton Supprimer** : Icône corbeille rouge (visible directement)\n• **Menu Options** : Accès aux commentaires et à la duplication\n\n💡 Le bouton supprimer est maintenant toujours visible pour une meilleure ergonomie !',
      side: 'left',
      align: 'start',
    },
  },

  // Step 17: Advanced Interactive Blocks
  {
    popover: {
      title: '⚡ Blocks Interactifs Avancés',
      description:
        'Enrichissez vos ressources avec des blocks interactifs :\n\n• **Button** : Appels à l\'action cliquables\n• **Alert** : Messages d\'information colorés\n• **Checklist** : Listes de tâches interactives\n• **Code** : Affichage de code avec coloration syntaxique\n• **Quiz** : Questions interactives avec scores\n• **Embed** : Intégration de contenu externe\n\nIdéal pour créer des ressources engageantes et pédagogiques !',
      side: 'bottom',
      align: 'center',
    },
  },

  // Step 18: Table of Contents
  {
    element: '[data-tour="table-of-contents"]',
    popover: {
      title: '📚 Table des Matières',
      description:
        'La table des matières est générée automatiquement à partir de vos tabs et sections. Elle facilite la navigation dans les ressources longues.',
      side: 'left',
      align: 'start',
    },
  },

  // Step 17: Settings Button
  {
    element: '[data-tour="settings-button"]',
    popover: {
      title: '⚙️ Paramètres de la Ressource',
      description:
        'Configurez les options avancées :\n• Afficher/masquer la table des matières\n• Activer/désactiver les commentaires\n• Suivre la progression de lecture\n\nCes paramètres affectent l\'affichage pour les lecteurs.',
      side: 'bottom',
      align: 'end',
    },
  },

  // Step 18: Variables
  {
    popover: {
      title: '🔤 Variables Dynamiques',
      description:
        'Utilisez des variables pour personnaliser le contenu :\n• {{nom_organisation}}\n• {{nom_membre}}\n• {{email_membre}}\n• {{date_actuelle}}\n\nElles seront automatiquement remplacées à l\'affichage.',
      side: 'bottom',
      align: 'center',
    },
  },

  // Step 19: Template System
  {
    popover: {
      title: '✨ Système de Templates',
      description:
        'Gagnez du temps avec les templates !\n\n**Utiliser un template :**\nAu démarrage, choisissez parmi les templates prédéfinis ou créés par votre organisation.\n\n**Créer un template :**\nCliquez sur "Sauvegarder comme modèle" pour sauvegarder votre ressource actuelle comme template réutilisable.\n\n💡 Parfait pour standardiser vos guides, formations, et processus !',
      side: 'bottom',
      align: 'center',
    },
  },

  // Step 20: Auto-save
  {
    popover: {
      title: '💾 Sauvegarde Automatique',
      description:
        'Vos modifications sont automatiquement sauvegardées toutes les secondes. Plus besoin de cliquer sur "Enregistrer" - travaillez en toute sérénité !\n\n✅ Toutes vos modifications sont sécurisées en temps réel.',
      side: 'bottom',
      align: 'center',
    },
  },

  // Step 21: Completion
  {
    popover: {
      title: '🎉 Vous êtes prêt !',
      description:
        'Vous connaissez maintenant toutes les fonctionnalités du créateur de ressources.\n\n💡 **Astuce** : Commencez avec un template pour gagner du temps !\n\nBesoin d\'aide ? Cliquez sur le bouton d\'aide (?) en haut à droite pour accéder à la documentation complète.',
      side: 'bottom',
      align: 'center',
    },
  },
];

/**
 * Configuration du tour Driver.js
 */
export const TOUR_CONFIG = {
  showProgress: true,
  allowClose: true,
  overlayClickNext: false,
  smoothScroll: true,
  animate: true,
  showButtons: ['next', 'previous', 'close'],
  nextBtnText: 'Suivant →',
  prevBtnText: '← Précédent',
  doneBtnText: 'Terminer ✓',
  closeBtnText: 'Fermer',
  progressText: '{{current}} sur {{total}}',
};

/**
 * Clé localStorage pour le statut du tour
 */
export const TOUR_COMPLETED_KEY = 'resourceBuilder_tourCompleted';

/**
 * Clé localStorage pour ne plus afficher automatiquement
 */
export const TOUR_AUTO_SHOW_DISABLED_KEY = 'resourceBuilder_tourAutoShowDisabled';
