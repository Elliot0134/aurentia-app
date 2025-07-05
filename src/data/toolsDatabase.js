export const toolsDatabase = {
  // JURIDIQUE & CONFORMITÉ
  juridique: [
    {
      id: 'contract-generator',
      name: 'Générateur de contrats commerciaux',
      description: 'Génère des contrats personnalisés selon vos besoins',
      longDescription: 'Cette automatisation utilise l\'IA pour créer des contrats juridiques personnalisés en fonction de votre secteur d\'activité. Elle inclut des clauses standards, des conditions spécifiques et s\'adapte aux réglementations en vigueur.',
      category: 'juridique',
      subcategory: 'contrats',
      icon: 'FileText',
      price: 12,
      complexity: 'Moyenne',
      estimatedTime: '10-15 min',
      outputType: 'PDF',
      tags: ['contrat', 'juridique', 'commercial'],
      features: [
        'Templates multiples selon le secteur',
        'Personnalisation automatique',
        'Export PDF professionnel',
        'Clauses juridiques à jour',
        'Validation automatique'
      ],
      popular: true,
      rating: 4.8,
      reviews: 156
    },
    {
      id: 'cgv-generator',
      name: 'Créateur de CGV/CGU',
      description: 'Conditions générales personnalisées pour votre activité',
      longDescription: 'Génère automatiquement des conditions générales de vente et d\'utilisation conformes à la réglementation française et européenne, adaptées à votre secteur d\'activité.',
      category: 'juridique',
      subcategory: 'conformité',
      icon: 'Shield',
      price: 8,
      complexity: 'Simple',
      estimatedTime: '5-10 min',
      outputType: 'PDF',
      tags: ['cgv', 'cgu', 'juridique', 'conformité'],
      features: [
        'Conformité RGPD',
        'Adaptation sectorielle',
        'Mise à jour automatique',
        'Export multi-format'
      ],
      popular: false,
      rating: 4.6,
      reviews: 89
    },
    {
      id: 'legal-mentions-generator',
      name: 'Générateur de mentions légales',
      description: 'Mentions légales conformes RGPD',
      longDescription: 'Crée des mentions légales complètes et conformes à la réglementation RGPD, adaptées à votre type d\'activité et votre présence en ligne.',
      category: 'juridique',
      subcategory: 'conformité',
      icon: 'Info',
      price: 6,
      complexity: 'Simple',
      estimatedTime: '3-5 min',
      outputType: 'HTML',
      tags: ['mentions légales', 'rgpd', 'conformité'],
      features: [
        'Conformité RGPD garantie',
        'Adaptation automatique',
        'Code HTML prêt',
        'Mise à jour réglementaire'
      ],
      popular: false,
      rating: 4.7,
      reviews: 134
    },
    {
      id: 'privacy-policy-generator',
      name: 'Rédacteur de politiques de confidentialité',
      description: 'Protection des données personnelles',
      longDescription: 'Génère une politique de confidentialité complète et conforme au RGPD, adaptée à vos pratiques de collecte et traitement des données.',
      category: 'juridique',
      subcategory: 'rgpd',
      icon: 'Lock',
      price: 10,
      complexity: 'Moyenne',
      estimatedTime: '8-12 min',
      outputType: 'PDF',
      tags: ['confidentialité', 'rgpd', 'données'],
      features: [
        'Conformité RGPD',
        'Analyse des traitements',
        'Clauses personnalisées',
        'Export professionnel'
      ],
      popular: true,
      rating: 4.9,
      reviews: 203
    },
    {
      id: 'company-statutes-generator',
      name: 'Créateur de statuts d\'entreprise',
      description: 'Statuts juridiques SARL, SAS, etc.',
      longDescription: 'Génère les statuts juridiques de votre entreprise selon la forme choisie (SARL, SAS, SASU, etc.) avec toutes les clauses nécessaires.',
      category: 'juridique',
      subcategory: 'création',
      icon: 'Building',
      price: 15,
      complexity: 'Avancée',
      estimatedTime: '20-30 min',
      outputType: 'PDF',
      tags: ['statuts', 'création', 'entreprise'],
      features: [
        'Formes juridiques multiples',
        'Clauses personnalisées',
        'Conformité légale',
        'Conseils intégrés'
      ],
      popular: false,
      rating: 4.5,
      reviews: 78
    }
  ],

  // FINANCE & BUSINESS PLAN
  finance: [
    {
      id: 'business-plan-generator',
      name: 'Générateur de business plan complet',
      description: 'Business plan professionnel structuré',
      longDescription: 'Crée un business plan complet avec analyse financière, étude de marché, stratégie commerciale et projections sur 3-5 ans.',
      category: 'finance',
      subcategory: 'planification',
      icon: 'TrendingUp',
      price: 15,
      complexity: 'Avancée',
      estimatedTime: '30-45 min',
      outputType: 'PDF',
      tags: ['business plan', 'finance', 'stratégie'],
      features: [
        'Structure professionnelle',
        'Projections financières',
        'Analyse de marché',
        'Graphiques intégrés',
        'Export investisseurs'
      ],
      popular: true,
      rating: 4.8,
      reviews: 178
    },
    {
      id: 'financing-plan-generator',
      name: 'Créateur de plan de financement',
      description: 'Besoins et ressources financières',
      longDescription: 'Élabore un plan de financement détaillé avec analyse des besoins, sources de financement et échéancier de remboursement.',
      category: 'finance',
      subcategory: 'financement',
      icon: 'Calculator',
      price: 12,
      complexity: 'Moyenne',
      estimatedTime: '15-25 min',
      outputType: 'Excel',
      tags: ['financement', 'budget', 'prévisionnel'],
      features: [
        'Calculs automatiques',
        'Scénarios multiples',
        'Graphiques dynamiques',
        'Export Excel'
      ],
      popular: false,
      rating: 4.5,
      reviews: 92
    },
    {
      id: 'pitch-deck-generator',
      name: 'Générateur de pitch deck',
      description: 'Présentations investisseurs optimisées',
      longDescription: 'Crée des présentations professionnelles pour lever des fonds, avec structure optimisée et design attractif.',
      category: 'finance',
      subcategory: 'levée de fonds',
      icon: 'Presentation',
      price: 18,
      complexity: 'Avancée',
      estimatedTime: '25-35 min',
      outputType: 'PowerPoint',
      tags: ['pitch', 'investisseurs', 'levée de fonds'],
      features: [
        'Templates professionnels',
        'Structure optimisée',
        'Design moderne',
        'Conseils intégrés'
      ],
      popular: true,
      rating: 4.7,
      reviews: 145
    },
    {
      id: 'financial-forecast-calculator',
      name: 'Calculateur de prévisionnel financier',
      description: 'Projections financières 3-5 ans',
      longDescription: 'Calcule automatiquement vos prévisionnels financiers avec compte de résultat, bilan et plan de trésorerie sur 3 à 5 ans.',
      category: 'finance',
      subcategory: 'prévisionnel',
      icon: 'LineChart',
      price: 10,
      complexity: 'Moyenne',
      estimatedTime: '15-20 min',
      outputType: 'Excel',
      tags: ['prévisionnel', 'finance', 'projections'],
      features: [
        'Calculs automatisés',
        'Tableaux de bord',
        'Scénarios optimiste/pessimiste',
        'Graphiques intégrés'
      ],
      popular: false,
      rating: 4.6,
      reviews: 112
    }
  ],

  // SEO & RÉFÉRENCEMENT
  seo: [
    {
      id: 'keyword-analyzer',
      name: 'Analyseur de mots-clés',
      description: 'Recherche et analyse de la concurrence',
      longDescription: 'Analyse approfondie des mots-clés de votre secteur avec volume de recherche, difficulté et opportunités.',
      category: 'seo',
      subcategory: 'recherche',
      icon: 'Search',
      price: 8,
      complexity: 'Simple',
      estimatedTime: '5-10 min',
      outputType: 'Excel',
      tags: ['seo', 'mots-clés', 'recherche'],
      features: [
        'Volume de recherche',
        'Analyse concurrence',
        'Opportunités identifiées',
        'Export détaillé'
      ],
      popular: false,
      rating: 4.4,
      reviews: 67
    },
    {
      id: 'seo-content-generator',
      name: 'Générateur de contenu SEO',
      description: 'Articles optimisés pour le référencement',
      longDescription: 'Crée du contenu optimisé SEO avec structure H1-H6, mots-clés intégrés et méta-descriptions.',
      category: 'seo',
      subcategory: 'contenu',
      icon: 'FileText',
      price: 10,
      complexity: 'Moyenne',
      estimatedTime: '15-20 min',
      outputType: 'HTML',
      tags: ['seo', 'contenu', 'rédaction'],
      features: [
        'Optimisation automatique',
        'Structure SEO',
        'Méta-données',
        'Analyse lisibilité'
      ],
      popular: true,
      rating: 4.6,
      reviews: 123
    },
    {
      id: 'meta-generator',
      name: 'Créateur de méta-descriptions',
      description: 'Optimisation SERP automatique',
      longDescription: 'Génère des méta-descriptions optimisées pour améliorer votre taux de clic dans les résultats de recherche.',
      category: 'seo',
      subcategory: 'optimisation',
      icon: 'Tag',
      price: 5,
      complexity: 'Simple',
      estimatedTime: '3-5 min',
      outputType: 'Text',
      tags: ['méta', 'serp', 'optimisation'],
      features: [
        'Longueur optimale',
        'Mots-clés intégrés',
        'Call-to-action',
        'A/B testing'
      ],
      popular: false,
      rating: 4.3,
      reviews: 89
    }
  ],

  // PRÉSENTATIONS & SLIDES
  presentation: [
    {
      id: 'powerpoint-generator',
      name: 'Générateur de PowerPoint professionnel',
      description: 'Présentations avec templates et contenu',
      longDescription: 'Crée des présentations PowerPoint professionnelles avec templates modernes et contenu adapté à votre secteur.',
      category: 'presentation',
      subcategory: 'business',
      icon: 'Monitor',
      price: 14,
      complexity: 'Moyenne',
      estimatedTime: '20-30 min',
      outputType: 'PowerPoint',
      tags: ['powerpoint', 'présentation', 'business'],
      features: [
        'Templates modernes',
        'Contenu personnalisé',
        'Animations intégrées',
        'Export haute qualité'
      ],
      popular: true,
      rating: 4.8,
      reviews: 189
    },
    {
      id: 'sales-presentation-creator',
      name: 'Créateur de présentation commerciale',
      description: 'Pitch produits/services optimisé',
      longDescription: 'Génère des présentations commerciales percutantes pour vos produits et services avec structure de vente optimisée.',
      category: 'presentation',
      subcategory: 'commercial',
      icon: 'Target',
      price: 12,
      complexity: 'Moyenne',
      estimatedTime: '15-25 min',
      outputType: 'PowerPoint',
      tags: ['commercial', 'vente', 'pitch'],
      features: [
        'Structure de vente',
        'Arguments percutants',
        'Visuels impactants',
        'Call-to-action'
      ],
      popular: false,
      rating: 4.5,
      reviews: 98
    }
  ],

  // RÉDACTION & CONTENU
  redaction: [
    {
      id: 'blog-article-generator',
      name: 'Générateur d\'articles de blog',
      description: 'Contenu thématique optimisé',
      longDescription: 'Rédige des articles de blog complets et engageants sur vos thématiques métier avec optimisation SEO.',
      category: 'redaction',
      subcategory: 'blog',
      icon: 'PenTool',
      price: 9,
      complexity: 'Simple',
      estimatedTime: '10-15 min',
      outputType: 'HTML',
      tags: ['blog', 'rédaction', 'contenu'],
      features: [
        'Rédaction automatique',
        'Optimisation SEO',
        'Structure professionnelle',
        'Ton personnalisable'
      ],
      popular: false,
      rating: 4.5,
      reviews: 98
    },
    {
      id: 'newsletter-creator',
      name: 'Créateur de newsletters',
      description: 'Emails marketing engageants',
      longDescription: 'Conçoit des newsletters professionnelles avec contenu personnalisé et design responsive pour vos campagnes email.',
      category: 'redaction',
      subcategory: 'email',
      icon: 'Mail',
      price: 8,
      complexity: 'Simple',
      estimatedTime: '8-12 min',
      outputType: 'HTML',
      tags: ['newsletter', 'email', 'marketing'],
      features: [
        'Design responsive',
        'Contenu personnalisé',
        'Templates modernes',
        'Optimisation mobile'
      ],
      popular: false,
      rating: 4.4,
      reviews: 76
    },
    {
      id: 'press-release-writer',
      name: 'Rédacteur de communiqués de presse',
      description: 'Annonces officielles professionnelles',
      longDescription: 'Rédige des communiqués de presse professionnels pour vos annonces importantes avec structure journalistique.',
      category: 'redaction',
      subcategory: 'communication',
      icon: 'Newspaper',
      price: 11,
      complexity: 'Moyenne',
      estimatedTime: '12-18 min',
      outputType: 'PDF',
      tags: ['communiqué', 'presse', 'communication'],
      features: [
        'Structure journalistique',
        'Ton professionnel',
        'Optimisation média',
        'Format standard'
      ],
      popular: false,
      rating: 4.3,
      reviews: 54
    }
  ],

  // ANALYSE & REPORTING
  analyse: [
    {
      id: 'activity-report-generator',
      name: 'Générateur de rapports d\'activité',
      description: 'Synthèses périodiques professionnelles',
      longDescription: 'Crée des rapports d\'activité complets avec KPIs, graphiques et analyses de performance.',
      category: 'analyse',
      subcategory: 'reporting',
      icon: 'BarChart3',
      price: 11,
      complexity: 'Moyenne',
      estimatedTime: '15-25 min',
      outputType: 'PDF',
      tags: ['rapport', 'analyse', 'kpi'],
      features: [
        'KPIs automatiques',
        'Graphiques intégrés',
        'Analyse comparative',
        'Export professionnel'
      ],
      popular: false,
      rating: 4.3,
      reviews: 78
    },
    {
      id: 'dashboard-creator',
      name: 'Créateur de tableaux de bord',
      description: 'KPIs visuels interactifs',
      longDescription: 'Génère des tableaux de bord interactifs avec vos KPIs essentiels et visualisations de données.',
      category: 'analyse',
      subcategory: 'visualisation',
      icon: 'PieChart',
      price: 13,
      complexity: 'Moyenne',
      estimatedTime: '20-30 min',
      outputType: 'HTML',
      tags: ['dashboard', 'kpi', 'visualisation'],
      features: [
        'Graphiques interactifs',
        'Mise à jour temps réel',
        'Export multi-format',
        'Personnalisation avancée'
      ],
      popular: false,
      rating: 4.6,
      reviews: 102
    }
  ],

  // DESIGN & IDENTITÉ
  design: [
    {
      id: 'brand-charter-generator',
      name: 'Générateur de charte graphique',
      description: 'Identité visuelle complète',
      longDescription: 'Crée une charte graphique professionnelle avec logo, couleurs, typographies et déclinaisons.',
      category: 'design',
      subcategory: 'identité',
      icon: 'Palette',
      price: 16,
      complexity: 'Avancée',
      estimatedTime: '35-50 min',
      outputType: 'PDF',
      tags: ['design', 'identité', 'charte'],
      features: [
        'Logo personnalisé',
        'Palette couleurs',
        'Guide d\'utilisation',
        'Déclinaisons multiples'
      ],
      popular: true,
      rating: 4.7,
      reviews: 167
    },
    {
      id: 'logo-creator',
      name: 'Créateur de logos',
      description: 'Concepts et variations de logos',
      longDescription: 'Génère plusieurs concepts de logos professionnels avec variations et déclinaisons pour votre marque.',
      category: 'design',
      subcategory: 'logo',
      icon: 'Zap',
      price: 12,
      complexity: 'Moyenne',
      estimatedTime: '20-30 min',
      outputType: 'SVG',
      tags: ['logo', 'design', 'marque'],
      features: [
        'Concepts multiples',
        'Variations couleurs',
        'Formats vectoriels',
        'Guide d\'utilisation'
      ],
      popular: false,
      rating: 4.4,
      reviews: 134
    }
  ],

  // DIGITAL & AUTOMATISATION
  digital: [
    {
      id: 'specifications-generator',
      name: 'Générateur de cahier des charges',
      description: 'Spécifications techniques détaillées',
      longDescription: 'Élabore un cahier des charges complet pour vos projets digitaux avec spécifications techniques et fonctionnelles.',
      category: 'digital',
      subcategory: 'technique',
      icon: 'Settings',
      price: 13,
      complexity: 'Moyenne',
      estimatedTime: '20-30 min',
      outputType: 'PDF',
      tags: ['cahier des charges', 'technique', 'digital'],
      features: [
        'Spécifications détaillées',
        'Architecture technique',
        'Planning projet',
        'Budget estimatif'
      ],
      popular: false,
      rating: 4.4,
      reviews: 85
    },
    {
      id: 'chatbot-creator',
      name: 'Créateur de chatbots',
      description: 'Automatisation support client',
      longDescription: 'Conçoit des chatbots intelligents pour automatiser votre support client avec scénarios personnalisés.',
      category: 'digital',
      subcategory: 'automatisation',
      icon: 'MessageCircle',
      price: 15,
      complexity: 'Avancée',
      estimatedTime: '25-40 min',
      outputType: 'JSON',
      tags: ['chatbot', 'automatisation', 'support'],
      features: [
        'Scénarios personnalisés',
        'Intelligence artificielle',
        'Intégration multi-canal',
        'Analytics intégrés'
      ],
      popular: true,
      rating: 4.6,
      reviews: 156
    }
  ]
};

// Catégories avec métadonnées
export const categories = [
  {
    id: 'all',
    name: 'Tous les outils',
    description: 'Tous les outils disponibles',
    icon: 'Grid3X3',
    color: 'gray',
    count: Object.values(toolsDatabase).flat().length
  },
  {
    id: 'juridique',
    name: 'Juridique & Conformité',
    description: 'Outils pour la création de documents juridiques et la conformité',
    icon: 'Scale',
    color: 'purple',
    count: toolsDatabase.juridique?.length || 0
  },
  {
    id: 'finance',
    name: 'Finance & Business Plan',
    description: 'Outils financiers et de planification business',
    icon: 'DollarSign',
    color: 'green',
    count: toolsDatabase.finance?.length || 0
  },
  {
    id: 'seo',
    name: 'SEO & Référencement',
    description: 'Outils d\'optimisation pour les moteurs de recherche',
    icon: 'Search',
    color: 'orange',
    count: toolsDatabase.seo?.length || 0
  },
  {
    id: 'presentation',
    name: 'Présentations & Slides',
    description: 'Générateurs de présentations professionnelles',
    icon: 'Monitor',
    color: 'red',
    count: toolsDatabase.presentation?.length || 0
  },
  {
    id: 'redaction',
    name: 'Rédaction & Contenu',
    description: 'Outils de création de contenu et rédaction',
    icon: 'PenTool',
    color: 'indigo',
    count: toolsDatabase.redaction?.length || 0
  },
  {
    id: 'analyse',
    name: 'Analyse & Reporting',
    description: 'Outils d\'analyse et de génération de rapports',
    icon: 'BarChart3',
    color: 'teal',
    count: toolsDatabase.analyse?.length || 0
  },
  {
    id: 'design',
    name: 'Design & Identité',
    description: 'Outils de création graphique et d\'identité visuelle',
    icon: 'Palette',
    color: 'pink',
    count: toolsDatabase.design?.length || 0
  },
  {
    id: 'digital',
    name: 'Digital & Automatisation',
    description: 'Outils numériques et d\'automatisation',
    icon: 'Zap',
    color: 'cyan',
    count: toolsDatabase.digital?.length || 0
  }
];

// Fonction utilitaire pour obtenir tous les outils
export const getAllTools = () => {
  return Object.values(toolsDatabase).flat();
};

// Fonction utilitaire pour obtenir les outils par catégorie
export const getToolsByCategory = (categoryId) => {
  if (categoryId === 'all') {
    return getAllTools();
  }
  return toolsDatabase[categoryId] || [];
};

// Fonction utilitaire pour obtenir un outil par ID
export const getToolById = (toolId) => {
  const allTools = getAllTools();
  return allTools.find(tool => tool.id === toolId);
};

// Fonction utilitaire pour rechercher des outils
export const searchTools = (query, categoryId = 'all') => {
  const tools = getToolsByCategory(categoryId);
  const searchQuery = query.toLowerCase();
  
  return tools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery) ||
    tool.description.toLowerCase().includes(searchQuery) ||
    tool.tags.some(tag => tag.toLowerCase().includes(searchQuery)) ||
    tool.features.some(feature => feature.toLowerCase().includes(searchQuery))
  );
};

// Fonction utilitaire pour filtrer les outils
export const filterTools = (tools, filters) => {
  let filteredTools = [...tools];

  // Filtre par complexité
  if (filters.complexity && filters.complexity.length > 0) {
    filteredTools = filteredTools.filter(tool =>
      filters.complexity.includes(tool.complexity.toLowerCase())
    );
  }

  // Filtre par prix
  if (filters.priceRange) {
    filteredTools = filteredTools.filter(tool =>
      tool.price >= filters.priceRange[0] && tool.price <= filters.priceRange[1]
    );
  }

  // Filtre par note
  if (filters.minRating) {
    filteredTools = filteredTools.filter(tool =>
      tool.rating >= filters.minRating
    );
  }

  // Filtre par type de sortie
  if (filters.outputType && filters.outputType.length > 0) {
    filteredTools = filteredTools.filter(tool =>
      filters.outputType.includes(tool.outputType)
    );
  }

  // Filtre par popularité
  if (filters.popularOnly) {
    filteredTools = filteredTools.filter(tool => tool.popular);
  }

  return filteredTools;
};

// Fonction utilitaire pour trier les outils
export const sortTools = (tools, sortBy) => {
  const sortedTools = [...tools];

  switch (sortBy) {
    case 'popular':
      return sortedTools.sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return b.rating - a.rating;
      });
    case 'price-asc':
      return sortedTools.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sortedTools.sort((a, b) => b.price - a.price);
    case 'rating':
      return sortedTools.sort((a, b) => b.rating - a.rating);
    case 'name':
      return sortedTools.sort((a, b) => a.name.localeCompare(b.name));
    case 'newest':
      return sortedTools.sort((a, b) => b.reviews - a.reviews);
    default:
      return sortedTools;
  }
};

export default toolsDatabase;