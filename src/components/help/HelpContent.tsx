import React from 'react';
import {
  Rocket, Layout, Package, Blocks, Sparkles, Lightbulb, HelpCircle,
  FileText, Image, Video, File, Table, Minus
} from 'lucide-react';

export interface HelpSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  keywords: string[];
}

/**
 * Contenu complet de la documentation du ResourceBuilder
 * Organisé en 7 sections principales
 */
export const HELP_SECTIONS: HelpSection[] = [
  // Section 1: Démarrage Rapide
  {
    id: 'getting-started',
    title: 'Démarrage Rapide',
    icon: Rocket,
    keywords: ['démarrage', 'commencer', 'introduction', 'guide', 'début', 'nouveau'],
    content: (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">Bienvenue dans le Créateur de Ressources</h3>

        <div className="prose prose-sm max-w-none space-y-6">
          <div>
            <h4 className="mb-3">Qu'est-ce qu'une ressource ?</h4>
            <p className="mb-3">
              Une ressource est un document structuré qui peut contenir du texte, des images, des vidéos,
              des fichiers et plus encore. Les ressources sont parfaites pour créer :
            </p>
            <ul className="space-y-1.5">
              <li>Des guides et tutoriels pour votre organisation</li>
              <li>De la documentation technique ou procédurale</li>
              <li>Des FAQ (Foires Aux Questions)</li>
              <li>Du contenu de formation et d'onboarding</li>
              <li>Des processus et workflows documentés</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3">Structure hiérarchique</h4>
            <p className="mb-3">Les ressources suivent une organisation en 3 niveaux :</p>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <code className="text-sm">
                Ressource<br/>
                ├─ Tab 1: Introduction<br/>
                │  ├─ Section: Bienvenue<br/>
                │  │  ├─ Block texte<br/>
                │  │  └─ Block image<br/>
                │  └─ Section: Objectifs<br/>
                ├─ Tab 2: Configuration<br/>
                │  └─ Section: Installation<br/>
                └─ Tags: [guide, onboarding]
              </code>
            </div>
          </div>

          <div>
            <h4 className="mb-3">Commencer avec un template</h4>
            <p className="mb-3">
              La manière la plus rapide de créer une ressource est d'utiliser un template prédéfini.
              Nous proposons 5 templates professionnels :
            </p>
            <ul className="space-y-1.5">
              <li><strong>Guide de démarrage</strong> - Pour l'onboarding complet</li>
              <li><strong>FAQ</strong> - Questions/réponses structurées</li>
              <li><strong>Processus/Procédure</strong> - Workflows documentés</li>
              <li><strong>Module de formation</strong> - Contenu pédagogique</li>
              <li><strong>Documentation technique</strong> - Référence complète</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3">Sauvegarde et publication</h4>
            <p>
              Vos modifications sont <strong>automatiquement sauvegardées</strong> toutes les secondes.
              Pas besoin de cliquer sur "Enregistrer" !
            </p>
          </div>
        </div>
      </div>
    ),
  },

  // Section 2: Gestion des Tabs
  {
    id: 'tabs',
    title: 'Gestion des Tabs',
    icon: Layout,
    keywords: ['tabs', 'onglets', 'navigation', 'organiser', 'structure', 'réorganiser'],
    content: (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">Organisation par Tabs</h3>

        <div className="prose prose-sm max-w-none space-y-6">
          <div>
            <h4 className="mb-3">Qu'est-ce qu'un Tab ?</h4>
            <p>
              Les tabs permettent d'organiser votre contenu en grandes sections thématiques.
              Chaque tab apparaît comme un onglet en haut de la ressource.
            </p>
          </div>

          <div>
            <h4 className="mb-3">Créer un nouveau tab</h4>
            <ol className="space-y-2">
              <li>Cliquez sur le bouton <strong>"+ Nouveau tab"</strong> dans la barre de tabs</li>
              <li>Le tab est créé avec un nom par défaut</li>
              <li>Cliquez sur l'icône d'édition pour personnaliser :
                <ul className="mt-2 space-y-1">
                  <li>Changez le titre</li>
                  <li>Choisissez une icône parmi 10+ options</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h4 className="mb-3">Réorganiser les tabs</h4>
            <p className="mb-3">
              Utilisez le <strong>glisser-déposer</strong> pour réorganiser vos tabs :
            </p>
            <ol className="space-y-2">
              <li>Cliquez et maintenez sur l'icône de poignée (⋮⋮)</li>
              <li>Glissez le tab à la position souhaitée</li>
              <li>Relâchez pour placer</li>
            </ol>
          </div>

          <div>
            <h4 className="mb-3">Éditer un tab</h4>
            <ul className="space-y-1.5">
              <li>Cliquez sur l'icône <strong>crayon</strong> pour entrer en mode édition</li>
              <li>Modifiez le titre et l'icône</li>
              <li>Cliquez sur la <strong>coche verte</strong> pour valider</li>
              <li>Ou sur le <strong>X rouge</strong> pour annuler</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3">Supprimer un tab</h4>
            <p className="text-orange-600 mb-3">
              ⚠️ <strong>Attention</strong> : La suppression d'un tab supprime toutes ses sections et leur contenu.
              Cette action est irréversible.
            </p>
            <ol className="space-y-2">
              <li>Cliquez sur l'icône <strong>poubelle</strong></li>
              <li>Confirmez dans la boîte de dialogue</li>
            </ol>
          </div>

          <div>
            <h4 className="mb-3">Bonnes pratiques</h4>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <ul className="space-y-1.5">
                <li>Utilisez des titres courts et descriptifs (2-3 mots)</li>
                <li>Choisissez des icônes représentatives</li>
                <li>Groupez le contenu de manière logique</li>
                <li>Limitez à 5-7 tabs pour une navigation facile</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // Section 3: Sections
  {
    id: 'sections',
    title: 'Organisation avec Sections',
    icon: Package,
    keywords: ['sections', 'collapsible', 'structurer', 'organiser', 'plier', 'déplier'],
    content: (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">Sections Collapsibles</h3>

        <div className="prose prose-sm max-w-none space-y-6">
          <div>
            <h4 className="mb-3">Qu'est-ce qu'une section ?</h4>
            <p>
              Les sections permettent de structurer le contenu à l'intérieur d'un tab.
              Elles sont collapsibles (repliables) pour faciliter la navigation.
            </p>
          </div>

          <div>
            <h4 className="mb-3">Créer une section</h4>
            <ol className="space-y-2">
              <li>Cliquez sur <strong>"+ Ajouter une section"</strong></li>
              <li>Donnez-lui un titre descriptif</li>
              <li>Ajoutez optionnellement une description</li>
              <li>Configurez si elle est collapsible (repliable)</li>
            </ol>
          </div>

          <div>
            <h4 className="mb-3">Anatomie d'une section</h4>
            <ul className="space-y-1.5">
              <li><strong>Titre</strong> : Nom de la section (obligatoire)</li>
              <li><strong>Description</strong> : Sous-titre explicatif (optionnel)</li>
              <li><strong>Icône collapse</strong> : Chevron pour plier/déplier</li>
              <li><strong>Contenu</strong> : Ensemble de blocks</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3">Réorganiser les sections</h4>
            <p className="mb-3">
              Comme les tabs, les sections peuvent être réorganisées par glisser-déposer :
            </p>
            <ol className="space-y-2">
              <li>Utilisez la poignée en haut à gauche de la section</li>
              <li>Glissez vers le haut ou le bas</li>
              <li>Relâchez pour placer</li>
            </ol>
          </div>

          <div>
            <h4 className="mb-3">Sections collapsibles</h4>
            <p className="mb-3">
              Les sections peuvent être repliées pour améliorer la lisibilité :
            </p>
            <ul className="space-y-1.5">
              <li>Cliquez sur l'en-tête de la section pour la replier/déplier</li>
              <li>Le contenu est masqué mais pas supprimé</li>
              <li>Utile pour les longues ressources</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3">Exemple d'organisation efficace</h4>
            <div className="bg-gray-50 p-4 rounded-lg border space-y-2">
              <div className="font-medium">Tab: Installation</div>
              <div className="ml-4">
                <div>→ Section: Prérequis</div>
                <div>→ Section: Installation Windows</div>
                <div>→ Section: Installation Mac</div>
                <div>→ Section: Installation Linux</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // Section 4: Types de Blocks
  {
    id: 'blocks',
    title: 'Types de Contenu (Blocks)',
    icon: Blocks,
    keywords: ['blocks', 'contenu', 'texte', 'image', 'vidéo', 'fichier', 'tableau', 'séparateur', 'markdown'],
    content: (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">6 Types de Blocks</h3>

        <div className="space-y-6">
          {/* Text Block */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5" style={{ color: 'var(--color-primary, #ff5932)' }} />
              <h4 className="font-semibold text-base">Texte / Markdown</h4>
            </div>
            <div className="prose prose-sm max-w-none space-y-3">
              <p className="mb-3"><strong>Description</strong> : Block de texte riche avec support Markdown complet.</p>
              <p className="mb-3"><strong>Utilisation</strong> : Idéal pour le contenu principal, explications, instructions.</p>

              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium mb-3">Syntaxe Markdown supportée :</p>
                <ul className="text-xs space-y-1.5">
                  <li><code># Titre</code> → Titre de niveau 1</li>
                  <li><code>## Titre</code> → Titre de niveau 2</li>
                  <li><code>**gras**</code> → <strong>gras</strong></li>
                  <li><code>*italique*</code> → <em>italique</em></li>
                  <li><code>[lien](url)</code> → Lien hypertexte</li>
                  <li><code>- item</code> → Liste à puces</li>
                  <li><code>1. item</code> → Liste numérotée</li>
                  <li><code>`code`</code> → Code inline</li>
                  <li><code>```code```</code> → Block de code</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600 mt-3">
                💡 <strong>Astuce</strong> : Utilisez le bouton "Aperçu" pour voir le rendu final !
              </p>
            </div>
          </div>

          {/* Image Block */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-5 h-5" style={{ color: 'var(--color-primary, #ff5932)' }} />
              <h4 className="font-semibold text-base">Image</h4>
            </div>
            <div className="prose prose-sm max-w-none space-y-3">
              <p><strong>Description</strong> : Upload et affichage d'images.</p>
              <p><strong>Formats supportés</strong> : JPG, PNG, GIF, WebP, SVG</p>
              <p><strong>Taille max</strong> : 10 MB par image</p>

              <div>
                <p className="mb-2"><strong>Options</strong> :</p>
                <ul className="space-y-1.5">
                  <li>URL de l'image (upload ou lien externe)</li>
                  <li>Texte alternatif (accessibilité)</li>
                  <li>Légende optionnelle</li>
                  <li>Taille personnalisée</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600 mt-3">
                💡 <strong>Astuce</strong> : Optimisez vos images avant upload pour de meilleures performances.
              </p>
            </div>
          </div>

          {/* Video Block */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Video className="w-5 h-5" style={{ color: 'var(--color-primary, #ff5932)' }} />
              <h4 className="font-semibold text-base">Vidéo</h4>
            </div>
            <div className="prose prose-sm max-w-none space-y-3">
              <p><strong>Description</strong> : Intégration de vidéos depuis des plateformes externes.</p>
              <p><strong>Plateformes supportées</strong> : YouTube, Vimeo, Dailymotion</p>

              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium mb-3">Formats d'URL acceptés :</p>
                <ul className="text-xs space-y-1.5">
                  <li>YouTube : <code>https://youtube.com/watch?v=...</code></li>
                  <li>YouTube : <code>https://youtu.be/...</code></li>
                  <li>Vimeo : <code>https://vimeo.com/...</code></li>
                  <li>Dailymotion : <code>https://dailymotion.com/video/...</code></li>
                </ul>
              </div>

              <p className="text-sm text-gray-600 mt-3">
                💡 <strong>Astuce</strong> : La vidéo sera automatiquement responsive (s'adapte à l'écran).
              </p>
            </div>
          </div>

          {/* File Block */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <File className="w-5 h-5 " style={{ color: 'var(--color-primary, #ff5932)' }} />
              <h4 className="font-semibold text-base">Fichier Joint</h4>
            </div>
            <div className="prose prose-sm max-w-none space-y-3">
              <p><strong>Description</strong> : Upload de documents téléchargeables.</p>
              <p><strong>Types de fichiers</strong> : PDF, DOCX, XLSX, PPTX, ZIP, etc.</p>
              <p><strong>Taille max</strong> : 50 MB par fichier</p>

              <div>
                <p className="mb-2"><strong>Utilisation</strong> :</p>
                <ul className="space-y-1.5">
                  <li>Documents de référence</li>
                  <li>Templates à télécharger</li>
                  <li>Formulaires PDF</li>
                  <li>Archives ZIP</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600 mt-3">
                💡 <strong>Astuce</strong> : Ajoutez une description claire du fichier pour aider les utilisateurs.
              </p>
            </div>
          </div>

          {/* Table Block */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Table className="w-5 h-5 " style={{ color: 'var(--color-primary, #ff5932)' }} />
              <h4 className="font-semibold text-base">Tableau</h4>
            </div>
            <div className="prose prose-sm max-w-none space-y-3">
              <p><strong>Description</strong> : Tableaux formatés avec syntaxe Markdown.</p>

              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium mb-3">Syntaxe Markdown :</p>
                <pre className="text-xs"><code>{`| Colonne 1 | Colonne 2 |
|-----------|-----------|
| Ligne 1   | Valeur 1  |
| Ligne 2   | Valeur 2  |`}</code></pre>
              </div>

              <div>
                <p className="mb-2"><strong>Alignement</strong> :</p>
                <ul className="text-xs space-y-1.5">
                  <li><code>:---</code> → Aligné à gauche</li>
                  <li><code>:---:</code> → Centré</li>
                  <li><code>---:</code> → Aligné à droite</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600 mt-3">
                💡 <strong>Astuce</strong> : Utilisez un générateur de tableaux Markdown en ligne pour plus de facilité.
              </p>
            </div>
          </div>

          {/* Divider Block */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Minus className="w-5 h-5 " style={{ color: 'var(--color-primary, #ff5932)' }} />
              <h4 className="font-semibold text-base">Séparateur</h4>
            </div>
            <div className="prose prose-sm max-w-none space-y-3">
              <p><strong>Description</strong> : Ligne horizontale de séparation visuelle.</p>
              <p><strong>Utilisation</strong> : Séparer des sections de contenu pour améliorer la lisibilité.</p>

              <div className="my-4">
                <hr className="border-t-2" />
              </div>

              <p className="text-sm text-gray-600 mt-3">
                💡 <strong>Astuce</strong> : Utilisez avec modération pour ne pas sur-segmenter votre contenu.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // Section 5: Fonctionnalités Avancées
  {
    id: 'advanced',
    title: 'Fonctionnalités Avancées',
    icon: Sparkles,
    keywords: ['avancé', 'variables', 'slash', 'tags', 'toc', 'table', 'matières', 'paramètres'],
    content: (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">Fonctionnalités Avancées</h3>

        <div className="space-y-8">
          {/* Slash Command */}
          <div className="border-l-4 pl-5 py-2" style={{ borderLeftColor: 'var(--color-primary, #ff5932)' }}>
            <h4 className="font-semibold mb-3">Menu Slash (/)</h4>
            <div className="prose prose-sm max-w-none space-y-3">
              <p>
                Tapez <code className="bg-gray-100 px-2 py-1 rounded">/</code> n'importe où dans une section
                pour ouvrir le menu rapide d'ajout de blocks.
              </p>
              <ul className="space-y-1.5">
                <li>Utilisez les flèches ↑↓ pour naviguer</li>
                <li>Appuyez sur Entrée pour sélectionner</li>
                <li>Ou tapez pour filtrer les options</li>
                <li>Échap pour fermer</li>
              </ul>
              <p className="text-sm text-gray-600">
                💡 C'est le moyen le plus rapide d'ajouter du contenu !
              </p>
            </div>
          </div>

          {/* Variables */}
          <div className="border-l-4 pl-5 py-2" style={{ borderLeftColor: 'var(--color-primary, #ff5932)' }}>
            <h4 className="font-semibold mb-3">Variables Dynamiques</h4>
            <div className="prose prose-sm max-w-none space-y-3">
              <p>Personnalisez automatiquement le contenu avec des variables :</p>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div><code>{"{{nom_organisation}}"}</code> → Nom de votre organisation</div>
                <div><code>{"{{nom_membre}}"}</code> → Nom du membre qui lit</div>
                <div><code>{"{{email_membre}}"}</code> → Email du membre</div>
                <div><code>{"{{date_actuelle}}"}</code> → Date du jour</div>
                <div><code>{"{{annee_actuelle}}"}</code> → Année en cours</div>
              </div>

              <p className="mt-4"><strong>Exemple d'utilisation</strong> :</p>
              <div className="bg-white p-3 rounded border space-y-3">
                <div>
                  <p className="text-sm mb-2">Dans votre texte :</p>
                  <code className="text-xs">Bonjour {"{{nom_membre}}"}, bienvenue chez {"{{nom_organisation}}"} !</code>
                </div>

                <div>
                  <p className="text-sm mb-2">Résultat pour l'utilisateur :</p>
                  <p className="text-sm">Bonjour Jean Dupont, bienvenue chez Mon Entreprise !</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="border-l-4 pl-5 py-2" style={{ borderLeftColor: 'var(--color-primary, #ff5932)' }}>
            <h4 className="font-semibold mb-3">Table des Matières Automatique</h4>
            <div className="prose prose-sm max-w-none space-y-3">
              <p>
                La table des matières est générée automatiquement à partir de vos tabs et sections.
              </p>
              <ul className="space-y-1.5">
                <li>Apparaît dans une sidebar sur le côté</li>
                <li>Navigation directe vers n'importe quelle section</li>
                <li>Indicateur de position actuelle</li>
                <li>Peut être masquée via les paramètres</li>
              </ul>
              <p className="text-sm text-gray-600">
                💡 Particulièrement utile pour les ressources longues (5 sections minimum).
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="border-l-4 pl-5 py-2" style={{ borderLeftColor: 'var(--color-primary, #ff5932)' }}>
            <h4 className="font-semibold mb-3">Tags et Catégorisation</h4>
            <div className="prose prose-sm max-w-none space-y-3">
              <p>Les tags facilitent l'organisation et la recherche de ressources.</p>

              <div>
                <p className="mb-2"><strong>Tags prédéfinis</strong> :</p>
                <div className="flex flex-wrap gap-2">
                  {['onboarding', 'guide', 'tutorial', 'référence', 'faq', 'processus', 'formation', 'important', 'débutant', 'avancé', 'administratif', 'technique'].map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-xs rounded">{tag}</span>
                  ))}
                </div>
              </div>

              <p>Vous pouvez également créer des tags personnalisés.</p>
            </div>
          </div>

          {/* Settings */}
          <div className="border-l-4 pl-5 py-2" style={{ borderLeftColor: 'var(--color-primary, #ff5932)' }}>
            <h4 className="font-semibold mb-3">Paramètres de la Ressource</h4>
            <div className="prose prose-sm max-w-none space-y-3">
              <p>Accédez aux paramètres via le bouton ⚙️ en haut à droite.</p>

              <ul className="space-y-1.5">
                <li><strong>Table des matières</strong> : Afficher/masquer la navigation</li>
                <li><strong>Commentaires</strong> : Permettre aux membres de commenter</li>
                <li><strong>Suivi de lecture</strong> : Tracker la progression des lecteurs</li>
              </ul>

              <p className="text-sm text-gray-600">
                💡 Ces paramètres affectent l'affichage pour les lecteurs, pas pour vous en tant qu'éditeur.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // Section 6: Astuces & Raccourcis
  {
    id: 'tips',
    title: 'Astuces & Raccourcis',
    icon: Lightbulb,
    keywords: ['astuces', 'raccourcis', 'clavier', 'productivité', 'tips', 'tricks'],
    content: (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">Astuces & Raccourcis</h3>

        <div className="prose prose-sm max-w-none space-y-6">
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
            <h4 className="mt-0 mb-4">Raccourcis Clavier</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span><kbd className="px-2 py-1 bg-white rounded border text-xs">Ctrl/Cmd + Shift + H</kbd></span>
                <span>Ouvrir l'aide</span>
              </div>
              <div className="flex justify-between">
                <span><kbd className="px-2 py-1 bg-white rounded border text-xs">/</kbd></span>
                <span>Menu slash (ajouter block)</span>
              </div>
              <div className="flex justify-between">
                <span><kbd className="px-2 py-1 bg-white rounded border text-xs">Échap</kbd></span>
                <span>Fermer les dialogues</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3">Copier-Coller depuis Word/Google Docs</h4>
            <p>
              Vous pouvez copier du contenu depuis Word ou Google Docs et le coller dans un block texte.
              Le formatage de base sera préservé.
            </p>
          </div>

          <div>
            <h4 className="mb-3">Performance et Limites</h4>
            <p className="mb-3"><strong>Limites recommandées pour de bonnes performances</strong> :</p>
            <ul className="space-y-1.5">
              <li>Tabs : 5-10 maximum</li>
              <li>Sections par tab : 10-15 maximum</li>
              <li>Blocks par section : 20-30 maximum</li>
              <li>Images : Optimisez avant upload (&lt; 500 KB idéalement)</li>
              <li>Vidéos : Utilisez des liens externes plutôt qu'uploads</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3">Accessibilité</h4>
            <div className="bg-green-50 p-5 rounded-lg border border-green-200">
              <p className="mt-0 mb-3"><strong>Bonnes pratiques d'accessibilité</strong> :</p>
              <ul className="space-y-1.5">
                <li>Ajoutez toujours un texte alternatif pour les images</li>
                <li>Utilisez des titres hiérarchiques (H1, H2, H3)</li>
                <li>Évitez les longues phrases sans ponctuation</li>
                <li>Utilisez des listes pour structurer l'information</li>
                <li>Assurez un bon contraste pour le texte</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="mb-3">Workflow Recommandé</h4>
            <ol className="space-y-2">
              <li>Commencez avec un template approprié</li>
              <li>Définissez vos tabs (structure globale)</li>
              <li>Créez les sections dans chaque tab</li>
              <li>Remplissez le contenu section par section</li>
              <li>Ajoutez les tags pour la catégorisation</li>
              <li>Relisez en mode aperçu</li>
              <li>Publiez !</li>
            </ol>
          </div>
        </div>
      </div>
    ),
  },

  // Section 7: FAQ
  {
    id: 'faq',
    title: 'Questions Fréquentes (FAQ)',
    icon: HelpCircle,
    keywords: ['faq', 'questions', 'problèmes', 'aide', 'comment'],
    content: (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">Questions Fréquentes</h3>

        <div className="space-y-5">
          <div className="border-l-4 pl-5 py-3" style={{ borderLeftColor: 'var(--color-primary, #ff5932)' }}>
            <h4 className="font-semibold mb-2">Comment dupliquer une ressource ?</h4>
            <p className="text-sm text-gray-700">
              Actuellement, la duplication n'est pas disponible directement. Vous pouvez créer une nouvelle
              ressource avec le même template et copier-coller le contenu section par section.
            </p>
          </div>

          <div className="border-l-4 pl-5 py-3" style={{ borderLeftColor: 'var(--color-primary, #ff5932)' }}>
            <h4 className="font-semibold mb-2">Puis-je réutiliser des sections entre ressources ?</h4>
            <p className="text-sm text-gray-700">
              Pas directement pour le moment. La meilleure approche est de copier le contenu de la section
              et de le coller dans la nouvelle ressource.
            </p>
          </div>

          <div className="border-l-4 pl-5 py-3" style={{ borderLeftColor: 'var(--color-primary, #ff5932)' }}>
            <h4 className="font-semibold mb-2">Les membres peuvent-ils éditer les ressources ?</h4>
            <p className="text-sm text-gray-700">
              Seuls les administrateurs et le personnel (staff) peuvent éditer les ressources.
              Les membres peuvent les lire et, si activé, laisser des commentaires.
            </p>
          </div>

          <div className="border-l-4 pl-5 py-3" style={{ borderLeftColor: 'var(--color-primary, #ff5932)' }}>
            <h4 className="font-semibold mb-2">Comment suivre qui a lu quoi ?</h4>
            <p className="text-sm text-gray-700">
              Activez le "Suivi de lecture" dans les paramètres de la ressource (bouton ⚙️).
              Vous pourrez ensuite voir les statistiques de consultation dans le tableau de bord.
            </p>
          </div>

          <div className="border-l-4 pl-5 py-3" style={{ borderLeftColor: 'var(--color-primary, #ff5932)' }}>
            <h4 className="font-semibold mb-2">Peut-on exporter une ressource en PDF ?</h4>
            <p className="text-sm text-gray-700">
              L'export PDF n'est pas encore disponible mais est prévu dans une prochaine version.
              En attendant, vous pouvez utiliser la fonction d'impression du navigateur (Ctrl+P).
            </p>
          </div>

          <div className="border-l-4 pl-5 py-3" style={{ borderLeftColor: 'var(--color-primary, #ff5932)' }}>
            <h4 className="font-semibold mb-2">Mes images ne s'affichent pas, pourquoi ?</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p>Vérifiez que :</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>L'image a été correctement uploadée</li>
                <li>Le format est supporté (JPG, PNG, GIF, WebP)</li>
                <li>La taille ne dépasse pas 10 MB</li>
                <li>Votre connexion internet est stable</li>
              </ul>
            </div>
          </div>

          <div className="border-l-4 pl-5 py-3" style={{ borderLeftColor: 'var(--color-primary, #ff5932)' }}>
            <h4 className="font-semibold mb-2">La sauvegarde automatique fonctionne-t-elle toujours ?</h4>
            <p className="text-sm text-gray-700">
              Oui, tant que vous êtes connecté et que votre connexion internet est active.
              Les modifications sont sauvegardées toutes les secondes après votre dernière modification.
            </p>
          </div>

          <div className="border-l-4 pl-5 py-3" style={{ borderLeftColor: 'var(--color-primary, #ff5932)' }}>
            <h4 className="font-semibold mb-2">Puis-je ajouter du code HTML personnalisé ?</h4>
            <p className="text-sm text-gray-700">
              Non, pour des raisons de sécurité, le HTML brut n'est pas supporté.
              Utilisez Markdown qui couvre la plupart des besoins de formatage.
            </p>
          </div>

          <div className="border-l-4 pl-5 py-3" style={{ borderLeftColor: 'var(--color-primary, #ff5932)' }}>
            <h4 className="font-semibold mb-2">Y a-t-il une limite au nombre de ressources ?</h4>
            <p className="text-sm text-gray-700">
              Non, vous pouvez créer autant de ressources que nécessaire pour votre organisation.
            </p>
          </div>

          <div className="border-l-4 pl-5 py-3" style={{ borderLeftColor: 'var(--color-primary, #ff5932)' }}>
            <h4 className="font-semibold mb-2">Comment puis-je obtenir plus d'aide ?</h4>
            <div className="text-sm text-gray-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Relancez le tour interactif depuis le bouton d'aide</li>
                <li>Consultez cette documentation complète</li>
                <li>Contactez le support de votre organisation</li>
                <li>Rejoignez le forum communautaire (si disponible)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export default HELP_SECTIONS;
