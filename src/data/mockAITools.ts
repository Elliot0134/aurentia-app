// Données de test temporaires pour le développement
export const mockAITools = [
  {
    id: '1',
    slug: 'generateur-contenu-blog',
    title: 'Générateur de contenu de blog',
    description: 'Cet outil utilise l\'intelligence artificielle pour créer du contenu de blog engageant et optimisé SEO. Il analyse votre sujet, votre audience cible et vos mots-clés pour produire des articles de haute qualité.',
    short_description: 'Générez automatiquement des articles de blog optimisés SEO',
    category: 'Rédaction',
    tags: ['blog', 'SEO', 'contenu', 'rédaction', 'marketing'],
    credits_cost: 10,
    icon_url: null,
    image_url: null,
    video_url: null,
    difficulty: 'Facile' as const,
    estimated_time: '2-3 minutes',
    webhook_url: 'https://webhook.n8n.example.com/blog-generator',
    features: [
      'Génération automatique d\'articles',
      'Optimisation SEO',
      'Adaptation au tone de voix',
      'Intégration de mots-clés',
      'Structure d\'article optimisée'
    ],
    what_you_get: [
      'Article de blog complet',
      'Titre accrocheur',
      'Meta description',
      'Tags et catégories',
      'Suggestions d\'images'
    ],
    how_to_use_steps: [
      {
        step: 1,
        title: 'Définissez votre sujet',
        description: 'Indiquez le sujet principal de votre article et votre audience cible.'
      },
      {
        step: 2,
        title: 'Configurez les paramètres',
        description: 'Ajustez le style, la longueur et les mots-clés dans les paramètres généraux.'
      },
      {
        step: 3,
        title: 'Générez le contenu',
        description: 'Cliquez sur Générer et obtenez votre article complet en quelques secondes.'
      }
    ],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    slug: 'analyseur-business-plan',
    title: 'Analyseur de Business Plan',
    description: 'Analysez et améliorez votre business plan avec notre IA experte. Obtenez des recommandations détaillées, identifiez les points faibles et recevez des suggestions d\'amélioration pour maximiser vos chances de succès.',
    short_description: 'Analysez et optimisez votre business plan avec l\'IA',
    category: 'Business',
    tags: ['business plan', 'analyse', 'stratégie', 'financement', 'conseil'],
    credits_cost: 25,
    icon_url: null,
    image_url: null,
    video_url: null,
    difficulty: 'Moyenne' as const,
    estimated_time: '5-7 minutes',
    webhook_url: 'https://webhook.n8n.example.com/business-analyzer',
    features: [
      'Analyse complète du business plan',
      'Identification des points faibles',
      'Recommandations d\'amélioration',
      'Analyse financière',
      'Évaluation des risques'
    ],
    what_you_get: [
      'Rapport d\'analyse détaillé',
      'Score de viabilité',
      'Plan d\'amélioration',
      'Recommandations sectorielles',
      'Checklist d\'optimisation'
    ],
    how_to_use_steps: [
      {
        step: 1,
        title: 'Téléchargez votre business plan',
        description: 'Soumettez votre business plan existant ou décrivez votre projet.'
      },
      {
        step: 2,
        title: 'Définissez vos objectifs',
        description: 'Précisez vos objectifs de financement et votre marché cible.'
      },
      {
        step: 3,
        title: 'Obtenez l\'analyse',
        description: 'Recevez un rapport détaillé avec des recommandations personnalisées.'
      }
    ],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    slug: 'generateur-presentation',
    title: 'Générateur de présentations',
    description: 'Créez des présentations professionnelles en quelques clics. Notre IA génère automatiquement les slides, le contenu et même suggère des visuels adaptés à votre sujet et votre audience.',
    short_description: 'Créez des présentations professionnelles automatiquement',
    category: 'Présentation',
    tags: ['présentation', 'slides', 'powerpoint', 'design', 'professionnel'],
    credits_cost: 15,
    icon_url: null,
    image_url: null,
    video_url: null,
    difficulty: 'Facile' as const,
    estimated_time: '3-4 minutes',
    webhook_url: 'https://webhook.n8n.example.com/presentation-generator',
    features: [
      'Génération automatique de slides',
      'Contenu structuré',
      'Design professionnel',
      'Suggestions de visuels',
      'Export multiple formats'
    ],
    what_you_get: [
      'Présentation complète',
      'Slides structurés',
      'Notes de présentation',
      'Suggestions d\'images',
      'Template personnalisé'
    ],
    how_to_use_steps: [
      {
        step: 1,
        title: 'Décrivez votre présentation',
        description: 'Indiquez le sujet, l\'audience et les objectifs de votre présentation.'
      },
      {
        step: 2,
        title: 'Choisissez le style',
        description: 'Sélectionnez le style visuel et le niveau de détail souhaité.'
      },
      {
        step: 3,
        title: 'Générez et exportez',
        description: 'Obtenez votre présentation et exportez-la dans le format de votre choix.'
      }
    ],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    slug: 'optimiseur-seo',
    title: 'Optimiseur SEO avancé',
    description: 'Optimisez votre contenu pour les moteurs de recherche avec notre outil d\'analyse SEO avancé. Analysez vos concurrents, trouvez les meilleurs mots-clés et obtenez des recommandations personnalisées.',
    short_description: 'Optimisez votre référencement naturel avec l\'IA',
    category: 'SEO',
    tags: ['SEO', 'référencement', 'mots-clés', 'analyse', 'optimisation'],
    credits_cost: 20,
    icon_url: null,
    image_url: null,
    video_url: null,
    difficulty: 'Difficile' as const,
    estimated_time: '8-10 minutes',
    webhook_url: 'https://webhook.n8n.example.com/seo-optimizer',
    features: [
      'Analyse de mots-clés',
      'Audit SEO technique',
      'Analyse concurrentielle',
      'Optimisation de contenu',
      'Suivi de performance'
    ],
    what_you_get: [
      'Rapport SEO complet',
      'Liste de mots-clés',
      'Plan d\'optimisation',
      'Recommandations techniques',
      'Stratégie de contenu'
    ],
    how_to_use_steps: [
      {
        step: 1,
        title: 'Analysez votre site',
        description: 'Entrez l\'URL de votre site et vos mots-clés principaux.'
      },
      {
        step: 2,
        title: 'Configurez l\'analyse',
        description: 'Définissez vos concurrents et votre marché géographique.'
      },
      {
        step: 3,
        title: 'Recevez les recommandations',
        description: 'Obtenez un plan d\'action SEO détaillé et personnalisé.'
      }
    ],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];