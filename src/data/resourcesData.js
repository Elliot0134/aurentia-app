// Données mock pour la marketplace de ressources
export const resourcesData = [
  {
    id: 1,
    name: "Template Business Plan Complet",
    description: "Un template Notion complet pour structurer votre business plan avec toutes les sections essentielles.",
    category: "business-plan",
    type: "notion",
    price: 29,
    originalPrice: 39,
    rating: 4.8,
    reviewCount: 156,
    downloadCount: 1240,
    image: "/placeholder.svg",
    preview: "/placeholder.svg",
    tags: ["Business Plan", "Notion", "Stratégie", "Financement"],
    author: {
      name: "Marie Dubois",
      avatar: "/placeholder.svg",
      verified: true
    },
    features: [
      "Analyse de marché complète",
      "Modèle financier intégré",
      "Templates de présentation",
      "Guide d'utilisation détaillé"
    ],
    difficulty: "Intermédiaire",
    estimatedTime: "2-3 heures",
    lastUpdated: "2024-12-15",
    popular: true,
    featured: true
  },
  {
    id: 2,
    name: "Pack Templates Canva - Réseaux Sociaux",
    description: "50+ templates Canva pour vos posts Instagram, LinkedIn et Facebook. Designs modernes et professionnels.",
    category: "marketing",
    type: "canva",
    price: 19,
    originalPrice: 29,
    rating: 4.9,
    reviewCount: 203,
    downloadCount: 890,
    image: "/placeholder.svg",
    preview: "/placeholder.svg",
    tags: ["Canva", "Social Media", "Design", "Marketing"],
    author: {
      name: "Thomas Martin",
      avatar: "/placeholder.svg",
      verified: true
    },
    features: [
      "50 templates uniques",
      "Formats Instagram, LinkedIn, Facebook",
      "Couleurs personnalisables",
      "Fonts incluses"
    ],
    difficulty: "Débutant",
    estimatedTime: "30 minutes",
    lastUpdated: "2024-12-10",
    popular: true,
    featured: false
  },
  {
    id: 3,
    name: "CRM Airtable pour Startups",
    description: "Base Airtable complète pour gérer vos prospects, clients et pipeline de vente.",
    category: "operations",
    type: "airtable",
    price: 24,
    originalPrice: 34,
    rating: 4.7,
    reviewCount: 89,
    downloadCount: 567,
    image: "/placeholder.svg",
    preview: "/placeholder.svg",
    tags: ["Airtable", "CRM", "Ventes", "Gestion"],
    author: {
      name: "Sophie Laurent",
      avatar: "/placeholder.svg",
      verified: true
    },
    features: [
      "Pipeline de vente automatisé",
      "Suivi des interactions",
      "Rapports et analytics",
      "Intégrations email"
    ],
    difficulty: "Intermédiaire",
    estimatedTime: "1-2 heures",
    lastUpdated: "2024-12-08",
    popular: false,
    featured: true
  },
  {
    id: 4,
    name: "Modèle Financier Excel Startup",
    description: "Modèle financier complet avec prévisions sur 3 ans, calcul de valorisation et tableaux de bord.",
    category: "finance",
    type: "excel",
    price: 39,
    originalPrice: 49,
    rating: 4.6,
    reviewCount: 124,
    downloadCount: 445,
    image: "/placeholder.svg",
    preview: "/placeholder.svg",
    tags: ["Excel", "Finance", "Prévisions", "Valorisation"],
    author: {
      name: "Alexandre Petit",
      avatar: "/placeholder.svg",
      verified: true
    },
    features: [
      "Prévisions 3 ans",
      "Calcul de valorisation",
      "Tableaux de bord automatisés",
      "Scénarios multiples"
    ],
    difficulty: "Avancé",
    estimatedTime: "3-4 heures",
    lastUpdated: "2024-12-05",
    popular: false,
    featured: false
  },
  {
    id: 5,
    name: "Guide Juridique Création d'Entreprise",
    description: "Guide complet PDF avec tous les documents juridiques nécessaires pour créer votre entreprise.",
    category: "legal",
    type: "pdf",
    price: 15,
    originalPrice: 25,
    rating: 4.5,
    reviewCount: 78,
    downloadCount: 334,
    image: "/placeholder.svg",
    preview: "/placeholder.svg",
    tags: ["Juridique", "Création", "Documents", "Guide"],
    author: {
      name: "Camille Rousseau",
      avatar: "/placeholder.svg",
      verified: false
    },
    features: [
      "Statuts types",
      "Contrats de travail",
      "CGV/CGU templates",
      "Checklist juridique"
    ],
    difficulty: "Débutant",
    estimatedTime: "1 heure",
    lastUpdated: "2024-12-01",
    popular: false,
    featured: false
  },
  {
    id: 6,
    name: "Dashboard Analytics Google Sheets",
    description: "Template Google Sheets pour tracker vos KPIs business avec graphiques automatisés.",
    category: "analytics",
    type: "google-sheets",
    price: 22,
    originalPrice: 32,
    rating: 4.8,
    reviewCount: 95,
    downloadCount: 678,
    image: "/placeholder.svg",
    preview: "/placeholder.svg",
    tags: ["Google Sheets", "Analytics", "KPIs", "Dashboard"],
    author: {
      name: "Julien Moreau",
      avatar: "/placeholder.svg",
      verified: true
    },
    features: [
      "KPIs automatisés",
      "Graphiques dynamiques",
      "Connexions API",
      "Rapports mensuels"
    ],
    difficulty: "Intermédiaire",
    estimatedTime: "2 heures",
    lastUpdated: "2024-11-28",
    popular: true,
    featured: false
  },
  {
    id: 7,
    name: "Pack Prompts IA Marketing",
    description: "Collection de 100+ prompts optimisés pour ChatGPT, Claude et autres IA pour le marketing.",
    category: "marketing",
    type: "prompts",
    price: 12,
    originalPrice: 18,
    rating: 4.9,
    reviewCount: 267,
    downloadCount: 1456,
    image: "/placeholder.svg",
    preview: "/placeholder.svg",
    tags: ["IA", "Prompts", "Marketing", "ChatGPT"],
    author: {
      name: "Emma Leroy",
      avatar: "/placeholder.svg",
      verified: true
    },
    features: [
      "100+ prompts testés",
      "Catégories organisées",
      "Exemples d'utilisation",
      "Mises à jour gratuites"
    ],
    difficulty: "Débutant",
    estimatedTime: "15 minutes",
    lastUpdated: "2024-12-12",
    popular: true,
    featured: true
  },
  {
    id: 8,
    name: "Template Pitch Deck Investisseurs",
    description: "Template PowerPoint professionnel pour présenter votre startup aux investisseurs.",
    category: "business-plan",
    type: "powerpoint",
    price: 35,
    originalPrice: 45,
    rating: 4.7,
    reviewCount: 142,
    downloadCount: 789,
    image: "/placeholder.svg",
    preview: "/placeholder.svg",
    tags: ["PowerPoint", "Pitch", "Investisseurs", "Présentation"],
    author: {
      name: "Lucas Dubois",
      avatar: "/placeholder.svg",
      verified: true
    },
    features: [
      "15 slides optimisées",
      "Design professionnel",
      "Animations incluses",
      "Guide de présentation"
    ],
    difficulty: "Intermédiaire",
    estimatedTime: "1-2 heures",
    lastUpdated: "2024-11-25",
    popular: false,
    featured: true
  }
];

// Catégories de ressources
export const resourceCategories = [
  {
    id: "all",
    name: "Toutes les ressources",
    count: resourcesData.length,
    icon: "Grid3X3"
  },
  {
    id: "business-plan",
    name: "Business Plan",
    count: resourcesData.filter(r => r.category === "business-plan").length,
    icon: "FileText"
  },
  {
    id: "marketing",
    name: "Marketing",
    count: resourcesData.filter(r => r.category === "marketing").length,
    icon: "Megaphone"
  },
  {
    id: "finance",
    name: "Finance",
    count: resourcesData.filter(r => r.category === "finance").length,
    icon: "DollarSign"
  },
  {
    id: "operations",
    name: "Opérations",
    count: resourcesData.filter(r => r.category === "operations").length,
    icon: "Settings"
  },
  {
    id: "legal",
    name: "Juridique",
    count: resourcesData.filter(r => r.category === "legal").length,
    icon: "Scale"
  },
  {
    id: "analytics",
    name: "Analytics",
    count: resourcesData.filter(r => r.category === "analytics").length,
    icon: "BarChart3"
  }
];

// Types de ressources
export const resourceTypes = [
  { id: "all", name: "Tous les types", icon: "Grid3X3" },
  { id: "notion", name: "Notion", icon: "FileText" },
  { id: "canva", name: "Canva", icon: "Palette" },
  { id: "airtable", name: "Airtable", icon: "Database" },
  { id: "excel", name: "Excel", icon: "Calculator" },
  { id: "google-sheets", name: "Google Sheets", icon: "Calculator" },
  { id: "pdf", name: "PDF", icon: "FileText" },
  { id: "powerpoint", name: "PowerPoint", icon: "Monitor" },
  { id: "prompts", name: "Prompts IA", icon: "Zap" }
];

// Niveaux de difficulté
export const difficultyLevels = [
  { id: "all", name: "Tous niveaux" },
  { id: "Débutant", name: "Débutant" },
  { id: "Intermédiaire", name: "Intermédiaire" },
  { id: "Avancé", name: "Avancé" }
];

// Fourchettes de prix
export const priceRanges = [
  { id: "all", name: "Tous les prix", min: 0, max: 1000 },
  { id: "free", name: "Gratuit", min: 0, max: 0 },
  { id: "low", name: "0€ - 20€", min: 0, max: 20 },
  { id: "medium", name: "20€ - 40€", min: 20, max: 40 },
  { id: "high", name: "40€+", min: 40, max: 1000 }
];