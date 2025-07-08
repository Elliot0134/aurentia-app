// Configuration des commissions
export const REVENUE_CONFIG = {
  CREATOR_PERCENTAGE: 0.80, // 80% pour le créateur
  AURENTIA_PERCENTAGE: 0.20, // 20% pour Aurentia
  PAYMENT_PROCESSING_FEE: 0.029, // 2.9% frais Stripe
  FIXED_FEE: 0.30 // 0.30€ frais fixe par transaction
};

/**
 * Calcule la répartition des revenus pour une vente
 * @param {number} price - Prix de vente du produit
 * @param {number} quantity - Quantité vendue (défaut: 1)
 * @returns {Object} Répartition détaillée des revenus
 */
export const calculateRevenueSplit = (price, quantity = 1) => {
  const grossRevenue = price * quantity;
  
  // Calcul des frais de traitement
  const processingFee = (grossRevenue * REVENUE_CONFIG.PAYMENT_PROCESSING_FEE) + REVENUE_CONFIG.FIXED_FEE;
  const netRevenue = grossRevenue - processingFee;
  
  // Répartition sur le revenu net
  const aurentiaShare = netRevenue * REVENUE_CONFIG.AURENTIA_PERCENTAGE;
  const creatorShare = netRevenue * REVENUE_CONFIG.CREATOR_PERCENTAGE;
  
  return {
    grossRevenue: Math.round(grossRevenue * 100) / 100,
    processingFee: Math.round(processingFee * 100) / 100,
    netRevenue: Math.round(netRevenue * 100) / 100,
    aurentiaShare: Math.round(aurentiaShare * 100) / 100,
    creatorShare: Math.round(creatorShare * 100) / 100,
    creatorPercentage: REVENUE_CONFIG.CREATOR_PERCENTAGE * 100,
    aurentiaPercentage: REVENUE_CONFIG.AURENTIA_PERCENTAGE * 100
  };
};

/**
 * Calcule les revenus totaux d'un créateur
 * @param {Array} sales - Liste des ventes du créateur
 * @returns {Object} Statistiques de revenus
 */
export const calculateCreatorRevenue = (sales) => {
  let totalGross = 0;
  let totalNet = 0;
  let totalCreatorShare = 0;
  let totalSales = 0;
  
  sales.forEach(sale => {
    const split = calculateRevenueSplit(sale.price, sale.quantity || 1);
    totalGross += split.grossRevenue;
    totalNet += split.netRevenue;
    totalCreatorShare += split.creatorShare;
    totalSales += sale.quantity || 1;
  });
  
  return {
    totalGross: Math.round(totalGross * 100) / 100,
    totalNet: Math.round(totalNet * 100) / 100,
    totalCreatorShare: Math.round(totalCreatorShare * 100) / 100,
    totalSales,
    averageOrderValue: totalSales > 0 ? Math.round((totalGross / totalSales) * 100) / 100 : 0
  };
};

/**
 * Calcule les revenus mensuels d'un créateur
 * @param {Array} sales - Liste des ventes avec dates
 * @param {number} months - Nombre de mois à analyser (défaut: 12)
 * @returns {Array} Données mensuelles de revenus
 */
export const calculateMonthlyRevenue = (sales, months = 12) => {
  const monthlyData = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const monthlySales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getFullYear() === date.getFullYear() && 
             saleDate.getMonth() === date.getMonth();
    });
    
    const monthRevenue = calculateCreatorRevenue(monthlySales);
    
    monthlyData.push({
      month: monthKey,
      monthName: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      ...monthRevenue
    });
  }
  
  return monthlyData;
};

/**
 * Calcule les métriques de performance d'un template
 * @param {Object} template - Données du template
 * @param {Array} sales - Ventes du template
 * @returns {Object} Métriques de performance
 */
export const calculateTemplateMetrics = (template, sales) => {
  const revenue = calculateCreatorRevenue(sales);
  const daysSincePublished = template.publishedAt ? 
    Math.floor((new Date() - new Date(template.publishedAt)) / (1000 * 60 * 60 * 24)) : 0;
  
  return {
    ...revenue,
    conversionRate: template.views > 0 ? Math.round((revenue.totalSales / template.views) * 10000) / 100 : 0,
    dailyRevenue: daysSincePublished > 0 ? Math.round((revenue.totalCreatorShare / daysSincePublished) * 100) / 100 : 0,
    rating: template.rating || 0,
    reviewsCount: template.reviewsCount || 0
  };
};

/**
 * Calcule le prix suggéré basé sur la complexité et la demande
 * @param {Object} params - Paramètres de calcul
 * @returns {number} Prix suggéré
 */
export const calculateSuggestedPrice = ({
  category,
  type,
  difficulty,
  fileCount,
  estimatedHours,
  marketDemand = 'medium'
}) => {
  // Prix de base par type
  const basePrices = {
    'Template Canva': 25,
    'Template Notion': 30,
    'Template Airtable': 28,
    'Template Excel': 35,
    'Guide PDF': 20,
    'Template Figma': 32
  };
  
  // Multiplicateurs par difficulté
  const difficultyMultipliers = {
    'Débutant': 1.0,
    'Intermédiaire': 1.3,
    'Avancé': 1.6
  };
  
  // Multiplicateurs par demande
  const demandMultipliers = {
    'low': 0.8,
    'medium': 1.0,
    'high': 1.2,
    'very_high': 1.4
  };
  
  // Multiplicateurs par catégorie
  const categoryMultipliers = {
    'business-plan': 1.4,
    'finance': 1.3,
    'design': 1.2,
    'marketing': 1.1,
    'operations': 1.0,
    'legal': 1.2
  };
  
  let basePrice = basePrices[type] || 25;
  
  // Ajustements
  basePrice *= difficultyMultipliers[difficulty] || 1.0;
  basePrice *= demandMultipliers[marketDemand] || 1.0;
  basePrice *= categoryMultipliers[category] || 1.0;
  
  // Bonus pour nombre de fichiers
  if (fileCount > 3) {
    basePrice *= 1.1;
  }
  
  // Bonus pour temps estimé
  if (estimatedHours > 10) {
    basePrice *= 1.15;
  }
  
  // Arrondir au .99 le plus proche
  return Math.floor(basePrice) + 0.99;
};

/**
 * Formate un montant en euros
 * @param {number} amount - Montant à formater
 * @returns {string} Montant formaté
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

/**
 * Calcule les statistiques globales de la marketplace
 * @param {Array} allSales - Toutes les ventes
 * @returns {Object} Statistiques globales
 */
export const calculateMarketplaceStats = (allSales) => {
  const totalRevenue = calculateCreatorRevenue(allSales);
  const aurentiaRevenue = allSales.reduce((sum, sale) => {
    const split = calculateRevenueSplit(sale.price, sale.quantity || 1);
    return sum + split.aurentiaShare;
  }, 0);
  
  const creatorsRevenue = totalRevenue.totalCreatorShare;
  
  return {
    totalGrossRevenue: totalRevenue.totalGross,
    totalNetRevenue: totalRevenue.totalNet,
    aurentiaRevenue: Math.round(aurentiaRevenue * 100) / 100,
    creatorsRevenue: Math.round(creatorsRevenue * 100) / 100,
    totalSales: totalRevenue.totalSales,
    averageOrderValue: totalRevenue.averageOrderValue,
    revenueGrowth: 0 // À calculer avec données historiques
  };
};