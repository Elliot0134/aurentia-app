export const automationsData = [
  {
    id: 1,
    name: "Génération de contrats",
    description: "Génère automatiquement des contrats personnalisés selon vos besoins",
    longDescription: "Cette automatisation utilise l'IA pour créer des contrats juridiques personnalisés en fonction de votre secteur d'activité. Elle inclut des clauses standards, des conditions spécifiques et s'adapte aux réglementations en vigueur.",
    category: "Juridique",
    price: 12,
    icon: "FileText",
    features: [
      "Templates multiples selon le secteur",
      "Personnalisation automatique",
      "Export PDF professionnel",
      "Clauses juridiques à jour",
      "Validation automatique"
    ],
    popular: true,
    rating: 4.8,
    reviews: 156,
    estimatedTime: "2-5 minutes",
    complexity: "Moyenne",
    isActive: false
  },
  {
    id: 2,
    name: "Emails de relance automatiques",
    description: "Système intelligent de relance clients pour améliorer vos encaissements",
    longDescription: "Automatisez vos relances clients avec des emails personnalisés et échelonnés. Le système s'adapte au profil client et optimise les taux de réponse.",
    category: "Marketing",
    price: 8,
    icon: "Mail",
    features: [
      "Relances échelonnées intelligentes",
      "Personnalisation par segment client",
      "Suivi des taux d'ouverture",
      "Templates professionnels",
      "Intégration CRM"
    ],
    popular: false,
    rating: 4.6,
    reviews: 89,
    estimatedTime: "Configuration 10 min",
    complexity: "Simple",
    isActive: false
  },
  {
    id: 3,
    name: "Analyse de marché express",
    description: "Analyse complète de votre marché et de la concurrence en quelques clics",
    longDescription: "Obtenez une analyse détaillée de votre marché cible, de la concurrence et des opportunités. Données actualisées et insights stratégiques inclus.",
    category: "Finance",
    price: 15,
    icon: "TrendingUp",
    features: [
      "Analyse concurrentielle approfondie",
      "Étude de marché sectorielle",
      "Identification des opportunités",
      "Benchmarking tarifaire",
      "Rapport PDF détaillé"
    ],
    popular: true,
    rating: 4.9,
    reviews: 203,
    estimatedTime: "15-30 minutes",
    complexity: "Avancée",
    isActive: false
  },
  {
    id: 4,
    name: "Gestion RH automatisée",
    description: "Automatisez vos processus RH : recrutement, onboarding, évaluations",
    longDescription: "Simplifiez votre gestion des ressources humaines avec des workflows automatisés pour le recrutement, l'intégration et le suivi des collaborateurs.",
    category: "RH",
    price: 10,
    icon: "Users",
    features: [
      "Tri automatique des CV",
      "Processus d'onboarding guidé",
      "Évaluations périodiques",
      "Suivi des formations",
      "Tableaux de bord RH"
    ],
    popular: false,
    rating: 4.4,
    reviews: 67,
    estimatedTime: "Configuration 20 min",
    complexity: "Moyenne",
    isActive: false
  },
  {
    id: 5,
    name: "Facturation intelligente",
    description: "Automatisez votre facturation avec relances et suivi des paiements",
    longDescription: "Système complet de facturation automatisée avec génération, envoi, relances et suivi des paiements. Intégration comptable incluse.",
    category: "Finance",
    price: 9,
    icon: "Receipt",
    features: [
      "Génération automatique des factures",
      "Envoi programmé par email",
      "Relances de paiement",
      "Suivi des encaissements",
      "Export comptable"
    ],
    popular: true,
    rating: 4.7,
    reviews: 134,
    estimatedTime: "5-10 minutes",
    complexity: "Simple",
    isActive: false
  },
  {
    id: 6,
    name: "Campagnes publicitaires IA",
    description: "Créez et optimisez vos campagnes publicitaires avec l'intelligence artificielle",
    longDescription: "L'IA analyse votre audience, crée des visuels et textes publicitaires, puis optimise vos campagnes en temps réel pour maximiser le ROI.",
    category: "Marketing",
    price: 18,
    icon: "Target",
    features: [
      "Création automatique de visuels",
      "Rédaction de textes publicitaires",
      "Ciblage audience optimisé",
      "Optimisation temps réel",
      "Reporting détaillé ROI"
    ],
    popular: false,
    rating: 4.5,
    reviews: 92,
    estimatedTime: "30-45 minutes",
    complexity: "Avancée",
    isActive: false
  },
  {
    id: 7,
    name: "Veille concurrentielle",
    description: "Surveillez automatiquement vos concurrents et les tendances du marché",
    longDescription: "Système de veille automatisée qui surveille vos concurrents, analyse les tendances du marché et vous alerte sur les opportunités et menaces.",
    category: "Marketing",
    price: 11,
    icon: "Eye",
    features: [
      "Surveillance concurrents 24/7",
      "Alertes prix et nouveautés",
      "Analyse des tendances",
      "Rapports hebdomadaires",
      "Recommandations stratégiques"
    ],
    popular: false,
    rating: 4.3,
    reviews: 78,
    estimatedTime: "Configuration 15 min",
    complexity: "Moyenne",
    isActive: false
  },
  {
    id: 8,
    name: "Support client intelligent",
    description: "Chatbot IA pour répondre automatiquement à vos clients 24/7",
    longDescription: "Chatbot intelligent qui apprend de vos FAQ et interactions pour répondre automatiquement aux questions clients avec escalade humaine si nécessaire.",
    category: "RH",
    price: 13,
    icon: "MessageCircle",
    features: [
      "Réponses automatiques 24/7",
      "Apprentissage continu",
      "Escalade vers humain",
      "Multicanal (web, email, SMS)",
      "Analytics des conversations"
    ],
    popular: true,
    rating: 4.6,
    reviews: 145,
    estimatedTime: "Configuration 25 min",
    complexity: "Moyenne",
    isActive: false
  }
];

export const categories = [
  { id: "all", name: "Toutes", count: automationsData.length },
  { id: "marketing", name: "Marketing", count: automationsData.filter(a => a.category === "Marketing").length },
  { id: "juridique", name: "Juridique", count: automationsData.filter(a => a.category === "Juridique").length },
  { id: "finance", name: "Finance", count: automationsData.filter(a => a.category === "Finance").length },
  { id: "rh", name: "RH", count: automationsData.filter(a => a.category === "RH").length }
];

export const automationPacks = [
  {
    id: "starter",
    name: "Pack Démarrage",
    description: "Les essentiels pour lancer votre activité",
    automations: [1, 2, 5], // IDs des automatisations
    originalPrice: 29,
    discountedPrice: 22,
    discount: 24,
    popular: true
  },
  {
    id: "growth",
    name: "Pack Croissance",
    description: "Automatisez votre développement commercial",
    automations: [2, 3, 6, 7],
    originalPrice: 52,
    discountedPrice: 39,
    discount: 25,
    popular: false
  },
  {
    id: "enterprise",
    name: "Pack Entreprise",
    description: "Solution complète pour entreprises établies",
    automations: [1, 3, 4, 5, 6, 8],
    originalPrice: 77,
    discountedPrice: 55,
    discount: 29,
    popular: false
  }
];